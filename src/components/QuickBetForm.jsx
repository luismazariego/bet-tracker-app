import { useState } from 'react'
import { useModal } from '../hooks/useModal'
import { createId, formatCurrency } from '../lib/bets'

const MODES = [
  { key: 'single', label: 'Simple' },
  { key: 'combo', label: 'Combinada' },
]

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

function createLine() {
  return { key: createId(), market: '', selection: '', odds: '' }
}

function createGroup() {
  return { key: createId(), match: '', competition: '', lines: [createLine()] }
}

function groupsFromBet(bet) {
  const groups = []

  for (const leg of bet.legs ?? []) {
    const key = `${leg.match}::${leg.competition}`
    let group = groups.find((item) => item.key === key)

    if (!group) {
      group = {
        key,
        match: leg.match,
        competition: leg.competition,
        lines: [],
      }
      groups.push(group)
    }

    group.lines.push({
      key: createId(),
      market: leg.market,
      selection: leg.selection,
      odds: String(leg.odds),
    })
  }

  return groups.length > 0 ? groups : [createGroup()]
}

function LineFields({
  line,
  lineIndex,
  groupKey,
  canRemove,
  onChange,
  onRemove,
}) {
  const fieldId = (field) => `line-${line.key}-${field}`

  return (
    <div className={lineIndex > 0 ? 'border-t border-slate-200 dark:border-slate-800 pt-3' : ''}>
      {lineIndex > 0 && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Selección {lineIndex + 1}
          </p>
          <button
            type="button"
            onClick={() => onRemove(groupKey, line.key)}
            disabled={!canRemove}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 transition hover:bg-white dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          >
            Quitar
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor={fieldId('market')} className={labelClass}>
            Mercado
          </label>
          <input
            id={fieldId('market')}
            type="text"
            value={line.market}
            onChange={(event) =>
              onChange(groupKey, line.key, 'market', event.target.value)
            }
            placeholder="Córners totales"
            className={inputClass}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId('selection')} className={labelClass}>
              Selección
            </label>
            <input
              id={fieldId('selection')}
              type="text"
              value={line.selection}
              onChange={(event) =>
                onChange(groupKey, line.key, 'selection', event.target.value)
              }
              placeholder="Más de 7"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor={fieldId('odds')} className={labelClass}>
              Cuota
            </label>
            <input
              id={fieldId('odds')}
              type="number"
              inputMode="decimal"
              min="1.01"
              step="0.01"
              value={line.odds}
              onChange={(event) =>
                onChange(groupKey, line.key, 'odds', event.target.value)
              }
              placeholder="1.60"
              className={inputClass}
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function GroupFields({
  group,
  groupIndex,
  combo,
  onChange,
  onLineChange,
  onAddLine,
  onRemoveLine,
}) {
  const fieldId = (field) => `group-${group.key}-${field}`
  const lines = combo ? group.lines : group.lines.slice(0, 1)

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={fieldId('match')} className={labelClass}>
          Partido
        </label>
        <input
          id={fieldId('match')}
          type="text"
          value={group.match}
          onChange={(event) => onChange(group.key, 'match', event.target.value)}
          placeholder="Barcelona vs Aston Villa"
          className={inputClass}
          autoFocus={groupIndex === 0}
          required
        />
      </div>

      <div>
        <label htmlFor={fieldId('competition')} className={labelClass}>
          Competición
        </label>
        <input
          id={fieldId('competition')}
          type="text"
          value={group.competition}
          onChange={(event) =>
            onChange(group.key, 'competition', event.target.value)
          }
          placeholder="Champions League"
          className={inputClass}
          required
        />
      </div>

      <div className="space-y-3">
        {lines.map((line, lineIndex) => (
          <LineFields
            key={line.key}
            line={line}
            lineIndex={lineIndex}
            groupKey={group.key}
            canRemove={group.lines.length > 1}
            onChange={onLineChange}
            onRemove={onRemoveLine}
          />
        ))}
      </div>

      {combo && (
        <button
          type="button"
          onClick={() => onAddLine(group.key)}
          className="w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800"
        >
          + Agregar selección
        </button>
      )}
    </div>
  )
}

export function QuickBetForm({ bet, onAdd, onUpdate, onClose }) {
  const isEditing = Boolean(bet)
  const [mode, setMode] = useState(() =>
    bet && (bet.legs?.length ?? 0) > 1 ? 'combo' : 'single',
  )
  const [groups, setGroups] = useState(() =>
    bet ? groupsFromBet(bet) : [createGroup()],
  )
  const [amount, setAmount] = useState(() =>
    bet ? String(bet.stake) : '',
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useModal(onClose)

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')

    if (nextMode === 'single') {
      setGroups((previous) => [
        { ...previous[0], lines: previous[0].lines.slice(0, 1) },
      ])
    }
  }

  function updateGroup(groupKey, field, value) {
    setGroups((previous) =>
      previous.map((group) =>
        group.key === groupKey ? { ...group, [field]: value } : group,
      ),
    )
    setError('')
  }

  function updateLine(groupKey, lineKey, field, value) {
    setGroups((previous) =>
      previous.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              lines: group.lines.map((line) =>
                line.key === lineKey ? { ...line, [field]: value } : line,
              ),
            }
          : group,
      ),
    )
    setError('')
  }

  function addLine(groupKey) {
    setGroups((previous) =>
      previous.map((group) =>
        group.key === groupKey
          ? { ...group, lines: [...group.lines, createLine()] }
          : group,
      ),
    )
  }

  function removeLine(groupKey, lineKey) {
    setGroups((previous) =>
      previous.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              lines: group.lines.filter((line) => line.key !== lineKey),
            }
          : group,
      ),
    )
  }

  function addGroup() {
    setGroups((previous) => [...previous, createGroup()])
  }

  function removeGroup(groupKey) {
    setGroups((previous) =>
      previous.filter((group) => group.key !== groupKey),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const stake = Number(amount)
    if (!Number.isFinite(stake) || stake <= 0) {
      setError('Introduce un monto mayor que 0.')
      return
    }

    const activeGroups = mode === 'combo' ? groups : groups.slice(0, 1)
    const normalizedLegs = []

    for (const [groupIndex, group] of activeGroups.entries()) {
      const match = group.match.trim()
      const competition = group.competition.trim()

      if (!match || !competition) {
        setError(`Completa partido y competición en el partido ${groupIndex + 1}.`)
        return
      }

      const lines = mode === 'combo' ? group.lines : group.lines.slice(0, 1)

      for (const [lineIndex, line] of lines.entries()) {
        if (!line.market.trim() || !line.selection.trim()) {
          setError(
            `Completa mercado y selección en la selección ${lineIndex + 1} del partido ${groupIndex + 1}.`,
          )
          return
        }

        const odds = Number(line.odds)
        if (!Number.isFinite(odds) || odds <= 1) {
          setError(
            `La cuota de la selección ${lineIndex + 1} del partido ${groupIndex + 1} debe ser mayor que 1.`,
          )
          return
        }

        normalizedLegs.push({
          id: createId(),
          match,
          competition,
          market: line.market.trim(),
          selection: line.selection.trim(),
          odds,
        })
      }
    }

    const combinedOdds = normalizedLegs.reduce(
      (total, leg) => total * leg.odds,
      1,
    )

    const payload = {
      legs: normalizedLegs,
      odds: Number(combinedOdds.toFixed(2)),
      stake,
    }

    setSubmitting(true)

    try {
      const result = isEditing
        ? await onUpdate(bet.id, payload)
        : await onAdd(payload)

      if (result?.ok === false) {
        setError(
          result.error ??
            (isEditing
              ? 'No se pudieron guardar los cambios.'
              : 'No se pudo guardar la apuesta.'),
        )
        return
      }

      onClose()
    } catch (err) {
      setError(
        err?.message ??
          (isEditing
            ? 'No se pudieron guardar los cambios.'
            : 'No se pudo guardar la apuesta.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const visibleGroups = mode === 'combo' ? groups : groups.slice(0, 1)
  const activeLines = visibleGroups.flatMap((group) =>
    mode === 'combo' ? group.lines : group.lines.slice(0, 1),
  )
  const combinedOdds = activeLines.reduce((total, line) => {
    const odds = Number(line.odds)
    return Number.isFinite(odds) && odds > 1 ? total * odds : total
  }, 1)
  const stake = Number(amount)
  const potentialReturn =
    Number.isFinite(stake) && stake > 0 ? stake * combinedOdds : 0

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
        aria-labelledby="quick-bet-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white dark:bg-slate-900 p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="quick-bet-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              {isEditing ? 'Editar apuesta' : 'Nueva apuesta'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEditing
                ? 'Actualiza las selecciones, la cuota o el monto de la apuesta.'
                : mode === 'combo'
                  ? 'Agrupa selecciones por partido y combínalas en una sola apuesta.'
                  : 'Se guardará como pendiente para resolverla más tarde.'}
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
          <div>
            <p className={labelClass}>Tipo de apuesta</p>
            <div
              className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1"
              role="group"
              aria-label="Tipo de apuesta"
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
          </div>

          <div className="space-y-3">
            {visibleGroups.map((group, groupIndex) => (
              <div
                key={group.key}
                className={
                  mode === 'combo'
                    ? 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4'
                    : ''
                }
              >
                {mode === 'combo' && (
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Partido {groupIndex + 1}
                    </p>
                    {groups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGroup(group.key)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 transition hover:bg-white dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        Quitar partido
                      </button>
                    )}
                  </div>
                )}

                <GroupFields
                  group={group}
                  groupIndex={groupIndex}
                  combo={mode === 'combo'}
                  onChange={updateGroup}
                  onLineChange={updateLine}
                  onAddLine={addLine}
                  onRemoveLine={removeLine}
                />
              </div>
            ))}
          </div>

          {mode === 'combo' && (
            <button
              type="button"
              onClick={addGroup}
              className="w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
            >
              + Añadir partido
            </button>
          )}

          {mode === 'combo' && activeLines.length > 1 && (
            <div className="space-y-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-indigo-900/70 dark:text-indigo-100/70">Cuota total</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  {combinedOdds.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-900/70 dark:text-indigo-100/70">Retorno potencial</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  {formatCurrency(potentialReturn)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="amount" className={labelClass}>
              Monto (USD)
            </label>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value)
                setError('')
              }}
              placeholder="50.00"
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
              {submitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Guardar apuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
