import { useCallback, useMemo, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { BetList } from './components/BetList'
import { ChangePasswordDialog } from './components/ChangePasswordDialog'
import { Dashboard } from './components/Dashboard'
import { QuickBetForm } from './components/QuickBetForm'
import { ResetPasswordScreen } from './components/ResetPasswordScreen'
import { useAuth } from './hooks/useAuth'
import { useBets } from './hooks/useBets'
import { useTheme } from './hooks/useTheme'
import { isSupabaseConfigured } from './lib/supabase'

const TABS = [
  { key: 'dashboard', label: 'Resumen' },
  { key: 'history', label: 'Histórico' },
]

function FullScreenMessage({ title, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
      <div className="max-w-md">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-base font-bold text-white">
          BT
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}

function ConfigNotice() {
  return (
    <FullScreenMessage title="Falta configurar Supabase">
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Crea un archivo <code>.env.local</code> en la raíz del proyecto con:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-left text-xs text-slate-100">
        {`VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=...`}
      </pre>
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Revisa el README para los pasos completos.
      </p>
    </FullScreenMessage>
  )
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const {
    user,
    loading: authLoading,
    passwordRecovery,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    changePassword,
  } = useAuth()
  const {
    bets,
    loading: betsLoading,
    error,
    addBet,
    updateBet,
    updateStatus,
    cashOutBet,
    removeBet,
  } = useBets(user)

  const [view, setView] = useState('dashboard')
  const [sportFilter, setSportFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBet, setEditingBet] = useState(null)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  const sportCounts = useMemo(
    () => ({
      all: bets.length,
      football: bets.filter((bet) => (bet.sport ?? 'football') === 'football')
        .length,
      basketball: bets.filter((bet) => bet.sport === 'basketball').length,
    }),
    [bets],
  )

  const sportFilteredBets = useMemo(
    () =>
      sportFilter === 'all'
        ? bets
        : bets.filter((bet) => (bet.sport ?? 'football') === sportFilter),
    [bets, sportFilter],
  )

  const openForm = useCallback(() => {
    setEditingBet(null)
    setIsFormOpen(true)
  }, [])
  const openEdit = useCallback((bet) => {
    setIsFormOpen(false)
    setEditingBet(bet)
  }, [])
  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingBet(null)
  }, [])
  const openAccount = useCallback(() => setIsAccountOpen(true), [])
  const closeAccount = useCallback(() => setIsAccountOpen(false), [])
  const handleSignOut = useCallback(async () => {
    setSignOutError('')

    try {
      await signOut()
    } catch (err) {
      setSignOutError(err?.message ?? 'No se pudo cerrar sesión.')
    }
  }, [signOut])

  const cancelRecovery = useCallback(() => {
    signOut().catch(() => undefined)
  }, [signOut])

  const handleRemove = useCallback(
    (id) => {
      if (window.confirm('¿Eliminar esta apuesta del histórico?')) {
        removeBet(id)
      }
    },
    [removeBet],
  )

  if (!isSupabaseConfigured) {
    return <ConfigNotice />
  }

  if (authLoading) {
    return (
      <FullScreenMessage title="Cargando...">
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Comprobando tu sesión.
        </p>
      </FullScreenMessage>
    )
  }

  if (passwordRecovery && user) {
    return (
      <ResetPasswordScreen
        onUpdatePassword={updatePassword}
        onCancel={cancelRecovery}
      />
    )
  }

  if (!user) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        onResetPassword={resetPassword}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              BT
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                Bet Tracker
              </p>
              <p className="max-w-[16rem] truncate text-xs leading-tight text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>

          <nav className="order-3 flex w-full gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 sm:order-none sm:w-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setView(tab.key)}
                className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition sm:flex-none ${
                  view === tab.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Cambiar a tema claro'
                  : 'Cambiar a tema oscuro'
              }
              title={
                theme === 'dark'
                  ? 'Cambiar a tema claro'
                  : 'Cambiar a tema oscuro'
              }
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {theme === 'dark' ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={openAccount}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Cuenta
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Salir
            </button>

            <button
              type="button"
              onClick={openForm}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <span className="text-base leading-none">+</span>
              <span>Nueva apuesta</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}

        {signOutError && (
          <p className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-300">
            {signOutError}
          </p>
        )}

        {betsLoading ? (
          <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            Cargando apuestas...
          </p>
        ) : view === 'dashboard' ? (
          <Dashboard
            bets={sportFilteredBets}
            sportFilter={sportFilter}
            sportCounts={sportCounts}
            onSportFilterChange={setSportFilter}
            onNewBet={openForm}
            onViewAll={() => setView('history')}
          />
        ) : (
          <BetList
            bets={sportFilteredBets}
            sportFilter={sportFilter}
            sportCounts={sportCounts}
            onSportFilterChange={setSportFilter}
            onUpdateStatus={updateStatus}
            onCashOut={cashOutBet}
            onRemove={handleRemove}
            onEdit={openEdit}
            onNewBet={openForm}
          />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-400 dark:text-slate-500 sm:px-6">
        Tus apuestas se sincronizan en la nube.
      </footer>

      {(isFormOpen || editingBet) && (
        <QuickBetForm
          bet={editingBet}
          onAdd={addBet}
          onUpdate={updateBet}
          onClose={closeForm}
        />
      )}

      {isAccountOpen && (
        <ChangePasswordDialog
          onChangePassword={changePassword}
          onClose={closeAccount}
        />
      )}
    </div>
  )
}

export default App
