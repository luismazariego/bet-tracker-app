import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }
  return supabase
}

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!supabase) return

    let active = true
    let receivedEvent = false

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!active) return
        receivedEvent = true
        if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
        if (event === 'SIGNED_OUT') setPasswordRecovery(false)
        setSession(nextSession)
        setLoading(false)
      },
    )

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active || receivedEvent) return
        setSession(data.session ?? null)
      })
      .catch(() => {
        if (!active || receivedEvent) return
        setSession(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await requireClient().auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await requireClient().auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await requireClient().auth.signOut()
    if (error) throw error
  }, [])

  const resetPassword = useCallback(async (email) => {
    const { error } = await requireClient().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password) => {
    const { data, error } = await requireClient().auth.updateUser({
      password,
    })
    if (error) throw error
    setPasswordRecovery(false)
    return data
  }, [])

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      const client = requireClient()
      const email = session?.user?.email

      if (!email) {
        throw new Error('No hay una sesión activa.')
      }

      const { error: authError } = await client.auth.signInWithPassword({
        email,
        password: currentPassword,
      })
      if (authError) throw authError

      const { data, error } = await client.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return data
    },
    [session],
  )

  return {
    user: session?.user ?? null,
    loading,
    passwordRecovery,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    changePassword,
  }
}
