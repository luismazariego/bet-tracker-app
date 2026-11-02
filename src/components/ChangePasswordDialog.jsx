import { useState } from 'react'
import { useModal } from '../hooks/useModal'

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

export function ChangePasswordDialog({ onClose, onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const containerRef = useModal(onClose)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmation) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    setSubmitting(true)

    try {
      await onChangePassword(currentPassword, newPassword)
      setDone(true)
    } catch (err) {
      setError(err?.message ?? 'No se pudo cambiar la contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="w-full max-w-md rounded-t-2xl bg-white dark:bg-slate-900 p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="change-password-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Cambiar contraseña
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Confirma tu contraseña actual y elige una nueva.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Cerrar formulario"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l8 8m0-8l-8 8"
              />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="mt-5 space-y-4">
            <p className="rounded-xl bg-emerald-50 dark:bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Contraseña actualizada correctamente.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="current-password" className={labelClass}>
                Contraseña actual
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value)
                  setError('')
                }}
                placeholder="Tu contraseña actual"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="new-password" className={labelClass}>
                Contraseña nueva
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value)
                  setError('')
                }}
                placeholder="Mínimo 6 caracteres"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="new-password-confirm" className={labelClass}>
                Repite la contraseña nueva
              </label>
              <input
                id="new-password-confirm"
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

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
