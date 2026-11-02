import { useState } from 'react'

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

export function ResetPasswordScreen({ onUpdatePassword, onCancel }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)

    try {
      await onUpdatePassword(password)
    } catch (err) {
      setError(err?.message ?? 'No se pudo actualizar la contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-white">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-base font-bold text-white">
            BT
          </span>
          <h1 className="mt-3 text-xl font-semibold tracking-tight">
            Nueva contraseña
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Introduce una contraseña nueva para tu cuenta.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6"
        >
          <div>
            <label htmlFor="reset-password" className={labelClass}>
              Contraseña nueva
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
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

          <div>
            <label htmlFor="reset-password-confirm" className={labelClass}>
              Repite la contraseña
            </label>
            <input
              id="reset-password-confirm"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value)
                setError('')
              }}
              placeholder="Mínimo 6 caracteres"
              className={inputClass}
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 dark:bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>

        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full text-center text-xs font-semibold text-slate-500 dark:text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  )
}
