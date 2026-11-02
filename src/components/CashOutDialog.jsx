import { useState } from 'react'
import { useModal } from '../hooks/useModal'
import {
  betSummary,
  formatCurrency,
  formatSignedCurrency,
  profitClass,
} from '../lib/bets'

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

export function CashOutDialog({ bet, onConfirm, onClose }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useModal(onClose)

  const value = Number(amount)
  const isValid = Number.isFinite(value) && value > 0
  const profit = isValid ? value - bet.stake : 0
  const summary = betSummary(bet)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isValid) {
      setError('Introduce un monto mayor que 0.')
      return
    }

    setSubmitting(true)

    try {
      const result = await onConfirm(bet.id, value)

      if (result?.ok === false) {
        setError(result.error ?? 'No se pudo cerrar la apuesta.')
        return
      }

      onClose()
    } catch (err) {
      setError(err?.message ?? 'No se pudo cerrar la apuesta.')
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
        aria-labelledby="cash-out-title"
        className="w-full max-w-md rounded-t-2xl bg-white dark:bg-slate-900 p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="cash-out-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Cerrar antes
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {summary.title}
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Monto apostado
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(bet.stake)}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="cash-out-amount" className={labelClass}>
              Cantidad con la que cerraste (USD)
            </label>
            <input
              id="cash-out-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value)
                setError('')
              }}
              placeholder={formatCurrency(bet.stake)}
              className={inputClass}
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/40 px-4 py-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Beneficio
            </span>
            <span className={`font-semibold ${profitClass(profit)}`}>
              {formatSignedCurrency(profit)}
            </span>
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
              {submitting ? 'Guardando...' : 'Confirmar cierre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
