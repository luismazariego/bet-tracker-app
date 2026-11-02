import { useMemo } from 'react'
import {
  STATUS_META,
  betProfit,
  betSummary,
  calcStats,
  formatCurrency,
  formatDate,
  formatPercent,
  formatSignedCurrency,
  profitClass,
} from '../lib/bets'
import { StatusBadge } from './StatusBadge'

function StatCard({ label, value, hint, valueClass = 'text-slate-900 dark:text-white' }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClass}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}

export function Dashboard({ bets, onNewBet, onViewAll }) {
  const stats = useMemo(() => calcStats(bets), [bets])

  const recentBets = useMemo(
    () =>
      [...bets]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [bets],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Resumen</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Tu rendimiento
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {bets.length === 0
              ? 'Todavía no hay apuestas registradas.'
              : `${bets.length} apuestas registradas · ${stats.settled} resueltas`}
          </p>
        </div>
        <button
          type="button"
          onClick={onNewBet}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <span className="text-base leading-none">+</span>
          Nueva apuesta
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Profit Total"
          value={formatSignedCurrency(stats.profit)}
          hint={`${formatCurrency(stats.staked)} apostado`}
          valueClass={profitClass(stats.profit)}
        />
        <StatCard
          label="Yield"
          value={formatPercent(stats.yieldPct)}
          hint="Beneficio / total apostado"
          valueClass={profitClass(stats.yieldPct)}
        />
        <StatCard
          label="Win Rate"
          value={formatPercent(stats.winRate)}
          hint={
            stats.cashedOut > 0
              ? `${stats.won} ganadas · ${stats.lost} perdidas · ${stats.cashedOut} cerradas antes`
              : `${stats.won} ganadas · ${stats.lost} perdidas`
          }
        />
        <StatCard
          label="Apuestas activas"
          value={stats.pending}
          hint={
            stats.pending === 1
              ? 'Pendiente de resolver'
              : 'Pendientes de resolver'
          }
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Últimas apuestas</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Verde ganada · Rojo perdida · Ámbar cerrada antes · Gris pendiente
            </p>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Ver histórico
          </button>
        </div>

        {recentBets.length === 0 ? (
          <div className="px-4 py-10 text-center sm:px-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Aún no hay apuestas
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Registra tu primera apuesta para empezar a ver tus métricas.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentBets.map((bet) => {
              const meta = STATUS_META[bet.status] ?? STATUS_META.PENDING
              const profit = betProfit(bet)
              const summary = betSummary(bet)

              return (
                <li
                  key={bet.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6"
                >
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${meta.dot}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {summary.title}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {summary.subtitle}
                    </p>
                  </div>
                  <div className="text-right text-xs sm:text-sm">
                    <p className="font-medium text-slate-900 dark:text-white">
                      @{bet.odds.toFixed(2)}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{formatCurrency(bet.stake)}</p>
                  </div>
                  <div className="w-24 text-right">
                    <p className={`text-sm font-semibold ${profitClass(profit)}`}>
                      {formatSignedCurrency(profit)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(bet.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={bet.status} />
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
