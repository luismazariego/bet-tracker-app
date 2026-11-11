import { useMemo, useState } from 'react'
import {
  STATUS,
  betProfit,
  betSummary,
  formatCurrency,
  formatDate,
  formatSignedCurrency,
  profitClass,
} from '../lib/bets'
import { CashOutDialog } from './CashOutDialog'
import { SportFilter } from './SportFilter'
import { StatusBadge } from './StatusBadge'

const FILTERS = [
  { key: 'ALL', label: 'Todas' },
  { key: STATUS.PENDING, label: 'Pendientes' },
  { key: STATUS.WON, label: 'Ganadas' },
  { key: STATUS.LOST, label: 'Perdidas' },
  { key: STATUS.CASHOUT, label: 'Cerradas antes' },
]

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 25]
const DEFAULT_PAGE_SIZE = 10

function pageWindow(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const result = []
  let previous = 0

  for (const page of sorted) {
    if (previous && page - previous > 1) {
      result.push(`ellipsis-${page}`)
    }
    result.push(page)
    previous = page
  }

  return result
}

function Pagination({
  page,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalItems === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Mostrando {start}–{end} de {totalItems} apuestas
        </p>
        <label htmlFor="page-size" className="sr-only">
          Apuestas por página
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} por página
            </option>
          ))}
        </select>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Paginación de apuestas">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Anterior
        </button>

        {pageWindow(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                item === page
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              className="px-1 text-xs text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            >
              …
            </span>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Siguiente
        </button>
      </nav>
    </div>
  )
}

function BetActions({ bet, onUpdateStatus, onCashOut, onRemove, onEdit }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onEdit(bet)}
        className="rounded-lg bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/25"
      >
        Editar
      </button>
      {bet.status === STATUS.PENDING ? (
        <>
          <button
            type="button"
            onClick={() => onUpdateStatus(bet.id, STATUS.WON)}
            className="rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-100 dark:hover:bg-emerald-500/25"
          >
            Ganada
          </button>
          <button
            type="button"
            onClick={() => onUpdateStatus(bet.id, STATUS.LOST)}
            className="rounded-lg bg-rose-50 dark:bg-rose-500/15 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 transition hover:bg-rose-100 dark:hover:bg-rose-500/25"
          >
            Perdida
          </button>
          <button
            type="button"
            onClick={() => onCashOut(bet)}
            className="rounded-lg bg-amber-50 dark:bg-amber-500/15 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 transition hover:bg-amber-100 dark:hover:bg-amber-500/25"
          >
            Cerrada antes
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onUpdateStatus(bet.id, STATUS.PENDING)}
          className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Reabrir
        </button>
      )}
      <button
        type="button"
        onClick={() => onRemove(bet.id)}
        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400"
        aria-label={`Eliminar apuesta ${betSummary(bet).title}`}
      >
        Eliminar
      </button>
    </div>
  )
}

function groupLegs(legs) {
  const groups = []

  for (const leg of legs) {
    const key = `${leg.match}::${leg.competition}`
    const existing = groups.find((group) => group.key === key)

    if (existing) {
      existing.legs.push(leg)
      if (existing.groupOdds == null && leg.groupOdds != null) {
        existing.groupOdds = leg.groupOdds
      }
    } else {
      groups.push({
        key,
        match: leg.match,
        competition: leg.competition,
        groupOdds: leg.groupOdds ?? null,
        legs: [leg],
      })
    }
  }

  return groups
}

function ComboLegs({ legs, className = '' }) {
  const groups = groupLegs(legs)

  return (
    <div className={`space-y-2.5 ${className}`}>
      {groups.map((group) => (
        <div key={group.key}>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {group.match}
            {group.competition && (
              <span className="font-normal text-slate-400 dark:text-slate-500">
                {' '}
                · {group.competition}
              </span>
            )}
            {group.groupOdds != null && (
              <span className="ml-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                @{Number(group.groupOdds).toFixed(2)}
              </span>
            )}
          </p>
          <ul className="mt-0.5 space-y-1">
            {group.legs.map((leg) => (
              <li key={leg.id} className="text-[11px] text-slate-500 dark:text-slate-400">
                {leg.market} · {leg.selection}
                {leg.odds != null && (
                  <>
                    {' '}
                    <span className="text-slate-400 dark:text-slate-500">
                      @{Number(leg.odds).toFixed(2)}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function BetList({
  bets,
  sportFilter,
  sportCounts,
  onSportFilterChange,
  onUpdateStatus,
  onCashOut,
  onRemove,
  onEdit,
  onNewBet,
}) {
  const [filter, setFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [cashOutTarget, setCashOutTarget] = useState(null)

  const counts = useMemo(
    () => ({
      ALL: bets.length,
      [STATUS.PENDING]: bets.filter((bet) => bet.status === STATUS.PENDING).length,
      [STATUS.WON]: bets.filter((bet) => bet.status === STATUS.WON).length,
      [STATUS.LOST]: bets.filter((bet) => bet.status === STATUS.LOST).length,
      [STATUS.CASHOUT]: bets.filter((bet) => bet.status === STATUS.CASHOUT)
        .length,
    }),
    [bets],
  )

  const filteredBets = useMemo(() => {
    const search = query.trim().toLowerCase()

    return [...bets]
      .filter((bet) => filter === 'ALL' || bet.status === filter)
      .filter((bet) => {
        if (!search) return true
        const summary = betSummary(bet)
        const haystack = [
          ...summary.legs.flatMap((leg) => [
            leg.match,
            leg.competition,
            leg.market,
            leg.selection,
          ]),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(search)
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [bets, filter, query])

  const totalPages = Math.max(1, Math.ceil(filteredBets.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedBets = filteredBets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Histórico</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Todas tus apuestas
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Filtra por estado y resuelve tus apuestas pendientes.
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SportFilter
          value={sportFilter}
          onChange={(value) => {
            onSportFilterChange(value)
            setPage(1)
          }}
          counts={sportCounts}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Filtra el histórico y los contadores por deporte.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {FILTERS.map(({ key, label }) => {
            const isActive = filter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilter(key)
                  setPage(1)
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {counts[key]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="sm:w-64">
          <label htmlFor="bet-search" className="sr-only">
            Buscar apuestas
          </label>
          <input
            id="bet-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar partido, mercado..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {filteredBets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-12 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No hay apuestas con estos filtros
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Prueba otro estado o limpia la búsqueda.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('ALL')
              setQuery('')
              setPage(1)
            }}
            className="mt-4 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Partido</th>
                    <th className="px-4 py-3">Mercado</th>
                    <th className="px-4 py-3 text-right">Cuota</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Beneficio</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pagedBets.map((bet) => {
                    const profit = betProfit(bet)
                    const summary = betSummary(bet)

                    return (
                      <tr key={bet.id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {summary.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {summary.isCombo
                              ? formatDate(bet.createdAt)
                              : `${summary.competition} · ${formatDate(bet.createdAt)}`}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {summary.isCombo ? (
                            <ComboLegs legs={summary.legs} />
                          ) : (
                            <>
                              <p className="text-slate-700 dark:text-slate-300">
                                {summary.legs[0].market}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {summary.legs[0].selection}
                              </p>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                          {bet.odds.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                          {formatCurrency(bet.stake)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={bet.status} />
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${profitClass(profit)}`}
                        >
                          {formatSignedCurrency(profit)}
                          {bet.status === STATUS.CASHOUT && (
                            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                              Cerrada en {formatCurrency(bet.cashOut)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <BetActions
                            bet={bet}
                            onUpdateStatus={onUpdateStatus}
                            onCashOut={setCashOutTarget}
                            onRemove={onRemove}
                            onEdit={onEdit}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {pagedBets.map((bet) => {
              const profit = betProfit(bet)
              const summary = betSummary(bet)

              return (
                <article
                  key={bet.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {summary.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {summary.isCombo
                          ? formatDate(bet.createdAt)
                          : `${summary.competition} · ${formatDate(bet.createdAt)}`}
                      </p>
                    </div>
                    <StatusBadge status={bet.status} />
                  </div>

                  {summary.isCombo ? (
                    <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-3">
                      <ComboLegs legs={summary.legs} />
                    </div>
                  ) : (
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">Mercado</dt>
                        <dd className="font-medium text-slate-800 dark:text-slate-200">
                          {summary.legs[0].market}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">Selección</dt>
                        <dd className="font-medium text-slate-800 dark:text-slate-200">
                          {summary.legs[0].selection}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">Cuota</dt>
                        <dd className="font-medium text-slate-800 dark:text-slate-200">
                          {bet.odds.toFixed(2)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">Monto</dt>
                        <dd className="font-medium text-slate-800 dark:text-slate-200">
                          {formatCurrency(bet.stake)}
                        </dd>
                      </div>
                    </dl>
                  )}

                  {summary.isCombo && (
                    <dl className="mt-3 flex items-center justify-between text-xs">
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">Cuota total</dt>
                        <dd className="font-medium text-slate-800 dark:text-slate-200">
                          {bet.odds.toFixed(2)}
                        </dd>
                      </div>
                      <div className="text-right">
                        <dt className="text-slate-500 dark:text-slate-400">Monto</dt>
                        <dd className="font-medium text-slate-800 dark:text-slate-200">
                          {formatCurrency(bet.stake)}
                        </dd>
                      </div>
                    </dl>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <p className={`text-sm font-semibold ${profitClass(profit)}`}>
                        {formatSignedCurrency(profit)}
                      </p>
                      {bet.status === STATUS.CASHOUT && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Cerrada en {formatCurrency(bet.cashOut)}
                        </p>
                      )}
                    </div>
                    <BetActions
                      bet={bet}
                      onUpdateStatus={onUpdateStatus}
                      onCashOut={setCashOutTarget}
                      onRemove={onRemove}
                      onEdit={onEdit}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filteredBets.length}
        onPageChange={(nextPage) =>
          setPage(Math.min(Math.max(nextPage, 1), totalPages))
        }
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize)
          setPage(1)
        }}
      />

      {cashOutTarget && (
        <CashOutDialog
          bet={cashOutTarget}
          onConfirm={onCashOut}
          onClose={() => setCashOutTarget(null)}
        />
      )}
    </div>
  )
}
