import { useCallback, useEffect, useState } from 'react'
import { STATUS } from '../lib/bets'
import { supabase } from '../lib/supabase'

const NOT_AUTHENTICATED = 'Debes iniciar sesión para continuar.'
const GENERIC_ERROR = 'No se pudo completar la acción.'

function mapBetRow(row) {
  return {
    id: row.id,
    odds: Number(row.odds),
    stake: Number(row.stake),
    status: row.status,
    cashOut: row.cash_out == null ? undefined : Number(row.cash_out),
    createdAt: row.created_at,
    legs: [...(row.bet_legs ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((leg) => ({
        id: leg.id,
        match: leg.match,
        competition: leg.competition,
        market: leg.market,
        selection: leg.selection,
        odds: Number(leg.odds),
      })),
  }
}

function mapLegsPayload(bet) {
  return bet.legs.map((leg) => ({
    match: leg.match,
    competition: leg.competition,
    market: leg.market,
    selection: leg.selection,
    odds: leg.odds,
  }))
}

async function fetchBets() {
  const { data, error } = await supabase
    .from('bets')
    .select('*, bet_legs(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapBetRow)
}

export function useBets(user) {
  const [bets, setBets] = useState([])
  const [loadedFor, setLoadedFor] = useState(null)
  const [error, setError] = useState('')

  const userId = user?.id ?? null

  const loading = Boolean(userId) && loadedFor !== userId
  const visibleBets = loadedFor === userId ? bets : []

  useEffect(() => {
    if (!userId) return

    let active = true

    fetchBets()
      .then((rows) => {
        if (!active) return
        setBets(rows)
        setError('')
        setLoadedFor(userId)
      })
      .catch((fetchError) => {
        if (!active) return
        setError(fetchError.message)
        setLoadedFor(userId)
      })

    return () => {
      active = false
      setLoadedFor(null)
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return

    try {
      const rows = await fetchBets()
      setBets(rows)
      setError('')
      setLoadedFor(userId)
    } catch (fetchError) {
      setError(fetchError.message)
    }
  }, [userId])

  const runMutation = useCallback(
    async (action) => {
      if (!userId || !supabase) {
        setError(NOT_AUTHENTICATED)
        return { ok: false, error: NOT_AUTHENTICATED }
      }

      try {
        const { error: mutationError } = await action()
        if (mutationError) throw mutationError
        await refresh()
        return { ok: true }
      } catch (mutationError) {
        const message = mutationError?.message ?? GENERIC_ERROR
        setError(message)
        return { ok: false, error: message }
      }
    },
    [userId, refresh],
  )

  const addBet = useCallback(
    (bet) =>
      runMutation(() =>
        supabase.rpc('create_bet', {
          p_odds: bet.odds,
          p_stake: bet.stake,
          p_legs: mapLegsPayload(bet),
        }),
      ),
    [runMutation],
  )

  const updateBet = useCallback(
    (id, bet) =>
      runMutation(() =>
        supabase.rpc('update_bet', {
          p_bet_id: id,
          p_odds: bet.odds,
          p_stake: bet.stake,
          p_legs: mapLegsPayload(bet),
        }),
      ),
    [runMutation],
  )

  const updateStatus = useCallback(
    (id, status) =>
      runMutation(() =>
        supabase
          .from('bets')
          .update({ status, cash_out: null })
          .eq('id', id),
      ),
    [runMutation],
  )

  const cashOutBet = useCallback(
    (id, amount) =>
      runMutation(() =>
        supabase
          .from('bets')
          .update({ status: STATUS.CASHOUT, cash_out: amount })
          .eq('id', id),
      ),
    [runMutation],
  )

  const removeBet = useCallback(
    (id) =>
      runMutation(() => supabase.from('bets').delete().eq('id', id)),
    [runMutation],
  )

  return {
    bets: visibleBets,
    loading,
    error,
    addBet,
    updateBet,
    updateStatus,
    cashOutBet,
    removeBet,
  }
}
