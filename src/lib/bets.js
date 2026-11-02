export const STATUS = {
  PENDING: 'PENDING',
  WON: 'WON',
  LOST: 'LOST',
  CASHOUT: 'CASHOUT',
}

export const STATUS_META = {
  [STATUS.PENDING]: {
    label: 'Pendiente',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-slate-700',
    dot: 'bg-slate-400',
    text: 'text-slate-500 dark:text-slate-400',
  },
  [STATUS.WON]: {
    label: 'Ganada',
    badge: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  [STATUS.LOST]: {
    label: 'Perdida',
    badge: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-200 dark:ring-rose-500/30',
    dot: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
  },
  [STATUS.CASHOUT]: {
    label: 'Cerrada antes',
    badge: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percent = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
})

export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function formatCurrency(value) {
  return currency.format(value)
}

export function formatSignedCurrency(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${currency.format(value)}`
}

export function formatPercent(value) {
  return `${percent.format(value)}%`
}

export function formatDate(isoDate) {
  return dateFormatter.format(new Date(isoDate))
}

export function profitClass(value) {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-rose-600 dark:text-rose-400'
  return 'text-slate-400 dark:text-slate-500'
}

export function betProfit(bet) {
  if (bet.status === STATUS.WON) return bet.stake * (bet.odds - 1)
  if (bet.status === STATUS.LOST) return -bet.stake
  if (bet.status === STATUS.CASHOUT) return (Number(bet.cashOut) || 0) - bet.stake
  return 0
}

export function normalizeBet(bet) {
  if (Array.isArray(bet.legs) && bet.legs.length > 0) return bet

  const { match, competition, market, selection, odds, ...rest } = bet

  return {
    ...rest,
    legs: [
      {
        id: `${bet.id ?? createId()}-leg`,
        match: match ?? '',
        competition: competition ?? '',
        market: market ?? '',
        selection: selection ?? '',
        odds: odds ?? 1,
      },
    ],
  }
}

export function betSummary(bet) {
  const legs = normalizeBet(bet).legs

  if (legs.length <= 1) {
    const leg = legs[0]
    return {
      isCombo: false,
      legs,
      title: leg.match,
      subtitle: `${leg.competition} · ${leg.market} · ${leg.selection}`,
      competition: leg.competition,
    }
  }

  const sameMatch = legs.every(
    (leg) =>
      leg.match === legs[0].match && leg.competition === legs[0].competition,
  )

  return {
    isCombo: true,
    legs,
    sameMatch,
    title: sameMatch
      ? `Combinada · ${legs.length} líneas`
      : `Combinada · ${legs.length} selecciones`,
    subtitle: sameMatch
      ? `${legs[0].match} · ${legs[0].competition}`
      : legs.map((leg) => `${leg.match} — ${leg.selection}`).join(' · '),
    competition: 'Combinada',
  }
}

export function calcStats(bets) {
  let staked = 0
  let profit = 0
  let won = 0
  let lost = 0
  let cashedOut = 0
  let pending = 0

  for (const bet of bets) {
    staked += bet.stake
    if (bet.status === STATUS.WON) {
      profit += bet.stake * (bet.odds - 1)
      won += 1
    } else if (bet.status === STATUS.LOST) {
      profit -= bet.stake
      lost += 1
    } else if (bet.status === STATUS.CASHOUT) {
      profit += (Number(bet.cashOut) || 0) - bet.stake
      cashedOut += 1
    } else {
      pending += 1
    }
  }

  const settled = won + lost + cashedOut
  return {
    staked,
    profit,
    won,
    lost,
    cashedOut,
    pending,
    settled,
    yieldPct: staked > 0 ? (profit / staked) * 100 : 0,
    winRate: settled > 0 ? (won / settled) * 100 : 0,
  }
}


