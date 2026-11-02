import { useState } from 'react'

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

const MODES = [
  { key: 'signin', label: 'Iniciar sesión' },
  { key: 'signup', label: 'Crear cuenta' },
]

export function AuthScreen({
  onSignIn,
  onSignUp,
  onResetPassword,
  theme,
  onToggleTheme,
}) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'forgot') {
        await onResetPassword(email.trim())
        setMessage(
          'Si el correo existe, recibirás un enlace para restablecer la contraseña.',
        )
      } else if (mode === 'signin') {
        await onSignIn(email.trim(), password)
      } else {
        const data = await onSignUp(email.trim(), password)
        if (!data.session) {
          setMessage(
            'Revisa tu correo para confirmar la cuenta y luego inicia sesión.',
          )
        }
      }
    } catch (err) {
      setError(err?.message ?? 'No se pudo completar la acción.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="flex justify-end px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
          }
          title={
            theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
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
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-base font-bold text-white">
              BT
            </span>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Bet Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Inicia sesión para sincronizar tus apuestas.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
            <div
              className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1"
              role="group"
              aria-label="Modo de acceso"
            >
              {MODES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => changeMode(item.key)}
                  aria-pressed={mode === item.key}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    mode === item.key
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="auth-email" className={labelClass}>
                  Correo electrónico
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  placeholder="tu@correo.com"
                  className={inputClass}
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="auth-password" className={labelClass}>
                    Contraseña
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                    minLength={6}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setError('')
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className={inputClass}
                    required
                  />
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => changeMode('forgot')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {mode === 'forgot' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => changeMode('signin')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Volver a iniciar sesión
                  </button>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-rose-50 dark:bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              )}

              {message && (
                <p className="rounded-xl bg-emerald-50 dark:bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? 'Procesando...'
                  : mode === 'signin'
                    ? 'Entrar'
                    : mode === 'signup'
                      ? 'Crear cuenta'
                      : 'Enviar enlace'}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Tus apuestas se guardan en la nube y se sincronizan entre
            dispositivos.
          </p>
        </div>
      </div>
    </div>
  )
}
