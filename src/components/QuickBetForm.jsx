import { useState } from 'react'
import { useModal } from '../hooks/useModal'
import { createId, formatCurrency, productOdds } from '../lib/bets'
import {
  CUSTOM_MARKET_KEY,
  MARKET_INPUT,
  SPORTS,
  buildSelectionText,
  defaultSelection,
  findMarket,
  formatMatch,
  marketCategoriesForSport,
  parseMatch,
  validateSelection,
} from '../lib/markets'

const MODES = [
  { key: 'single', label: 'Simple' },
  { key: 'combo', label: 'Combinada' },
]

const SPORT_OPTIONS = [
  { key: SPORTS.FOOTBALL, label: 'Fútbol' },
  { key: SPORTS.BASKETBALL, label: 'Basketball' },
]

const ODDS_MODES = [
  { key: 'line', label: 'Cuota por selección' },
  { key: 'group', label: 'Cuota por partido' },
]

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

function createLine() {
  return {
    key: createId(),
    marketKey: '',
    market: '',
    selection: '',
    selectionData: null,
    odds: '',
  }
}

function createGroup() {
  return {
    key: createId(),
    home: '',
    away: '',
    competition: '',
    odds: '',
    lines: [createLine()],
  }
}

function lineFromLeg(leg, sport) {
  const market = findMarket(leg.marketKey, sport)

  if (market) {
    return {
      key: createId(),
      marketKey: leg.marketKey,
      market: '',
      selection: '',
      selectionData: leg.selectionData ?? defaultSelection(market),
      odds: leg.odds == null ? '' : String(leg.odds),
    }
  }

  return {
    key: createId(),
    marketKey: CUSTOM_MARKET_KEY,
    market: leg.market ?? '',
    selection: leg.selection ?? '',
    selectionData: null,
    odds: leg.odds == null ? '' : String(leg.odds),
  }
}

function groupsFromBet(bet) {
  const groups = []
  const sport = bet.sport ?? SPORTS.FOOTBALL

  for (const leg of bet.legs ?? []) {
    const key = `${leg.match}::${leg.competition}`
    let group = groups.find((item) => item.key === key)

    if (!group) {
      group = {
        key,
        ...parseMatch(leg.match),
        competition: leg.competition,
        odds: '',
        lines: [],
      }
      groups.push(group)
    }

    group.lines.push(lineFromLeg(leg, sport))

    if (group.odds === '' && leg.groupOdds != null) {
      group.odds = String(leg.groupOdds)
    }
  }

  return groups.length > 0 ? groups : [createGroup()]
}

function SelectionFields({ line, market, home, away, onChange }) {
  if (!market || market.inputType === MARKET_INPUT.CUSTOM) return null

  const data = line.selectionData ?? {}
  const local = home.trim() || 'Local'
  const visitor = away.trim() || 'Visita'
  const fieldId = (field) => `selection-${line.key}-${field}`

  if (market.inputType === MARKET_INPUT.WINNER) {
    return (
      <div>
        <label htmlFor={fieldId('winner')} className={labelClass}>
          Resultado
        </label>
        <select
          id={fieldId('winner')}
          value={data.value ?? 'home'}
          onChange={(event) => onChange({ ...data, value: event.target.value })}
          className={inputClass}
        >
          <option value="home">{local}</option>
          {market.allowDraw !== false && (
            <option value="draw">Empate</option>
          )}
          <option value="away">{visitor}</option>
        </select>
      </div>
    )
  }

  if (market.inputType === MARKET_INPUT.DOUBLE_CHANCE) {
    return (
      <div>
        <label htmlFor={fieldId('double')} className={labelClass}>
          Doble oportunidad
        </label>
        <select
          id={fieldId('double')}
          value={data.value ?? '1X'}
          onChange={(event) => onChange({ ...data, value: event.target.value })}
          className={inputClass}
        >
          <option value="1X">{local} o Empate</option>
          <option value="12">{local} o {visitor}</option>
          <option value="X2">Empate o {visitor}</option>
        </select>
      </div>
    )
  }

  if (market.inputType === MARKET_INPUT.YES_NO) {
    return (
      <div>
        <label htmlFor={fieldId('yesno')} className={labelClass}>
          Selección
        </label>
        <select
          id={fieldId('yesno')}
          value={data.value ?? 'yes'}
          onChange={(event) => onChange({ ...data, value: event.target.value })}
          className={inputClass}
        >
          <option value="yes">Sí</option>
          <option value="no">No</option>
        </select>
      </div>
    )
  }

  if (market.inputType === MARKET_INPUT.OVER_UNDER) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('direction')} className={labelClass}>
            Selección
          </label>
          <select
            id={fieldId('direction')}
            value={data.direction ?? 'over'}
            onChange={(event) =>
              onChange({ ...data, direction: event.target.value })
            }
            className={inputClass}
          >
            <option value="over">Más de</option>
            <option value="under">Menos de</option>
          </select>
        </div>
        <div>
          <label htmlFor={fieldId('line')} className={labelClass}>
            Línea
          </label>
          <input
            id={fieldId('line')}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={data.line ?? ''}
            onChange={(event) =>
              onChange({ ...data, line: event.target.value })
            }
            placeholder="2.5"
            className={inputClass}
          />
        </div>
      </div>
    )
  }

  if (market.inputType === MARKET_INPUT.RANGE) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('min')} className={labelClass}>
            Mínimo
          </label>
          <input
            id={fieldId('min')}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={data.min ?? ''}
            onChange={(event) =>
              onChange({ ...data, min: event.target.value })
            }
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={fieldId('max')} className={labelClass}>
            Máximo
          </label>
          <input
            id={fieldId('max')}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={data.max ?? ''}
            onChange={(event) =>
              onChange({ ...data, max: event.target.value })
            }
            placeholder="2"
            className={inputClass}
          />
        </div>
      </div>
    )
  }

  if (market.inputType === MARKET_INPUT.PLAYER) {
    return (
      <div>
        <label htmlFor={fieldId('player')} className={labelClass}>
          Jugador (nombre o número)
        </label>
        <input
          id={fieldId('player')}
          type="text"
          value={data.player ?? ''}
          onChange={(event) =>
            onChange({ ...data, player: event.target.value })
          }
          placeholder="Messi o 10"
          className={inputClass}
        />
      </div>
    )
  }

  if (market.inputType === MARKET_INPUT.PLAYER_OVER_UNDER) {
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor={fieldId('player')} className={labelClass}>
            Jugador (nombre o número)
          </label>
          <input
            id={fieldId('player')}
            type="text"
            value={data.player ?? ''}
            onChange={(event) =>
              onChange({ ...data, player: event.target.value })
            }
            placeholder="LeBron James o 23"
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId('player-direction')} className={labelClass}>
              Selección
            </label>
            <select
              id={fieldId('player-direction')}
              value={data.direction ?? 'over'}
              onChange={(event) =>
                onChange({ ...data, direction: event.target.value })
              }
              className={inputClass}
            >
              <option value="over">Más de</option>
              <option value="under">Menos de</option>
            </select>
          </div>
          <div>
            <label htmlFor={fieldId('player-line')} className={labelClass}>
              Línea
            </label>
            <input
              id={fieldId('player-line')}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={data.line ?? ''}
              onChange={(event) =>
                onChange({ ...data, line: event.target.value })
              }
              placeholder="24.5"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

function LineFields({
  line,
  lineIndex,
  group,
  sport,
  canRemove,
  lineMode,
  onMarketChange,
  onFieldChange,
  onSelectionChange,
  onRemove,
}) {
  const fieldId = (field) => `line-${line.key}-${field}`
  const market = findMarket(line.marketKey, sport)

  return (
    <div
      className={
        lineIndex > 0
          ? 'border-t border-slate-200 dark:border-slate-800 pt-3'
          : ''
      }
    >
      {lineIndex > 0 && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Selección {lineIndex + 1}
          </p>
          <button
            type="button"
            onClick={() => onRemove(group.key, line.key)}
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
          <select
            id={fieldId('market')}
            value={line.marketKey}
            onChange={(event) =>
              onMarketChange(group.key, line.key, event.target.value)
            }
            className={inputClass}
            required
          >
            <option value="">Selecciona un mercado</option>
            {marketCategoriesForSport(sport).map((category) => (
              <optgroup key={category.key} label={category.label}>
                {category.markets.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {market?.inputType === MARKET_INPUT.CUSTOM && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={fieldId('custom-market')} className={labelClass}>
                Mercado libre
              </label>
              <input
                id={fieldId('custom-market')}
                type="text"
                value={line.market}
                onChange={(event) =>
                  onFieldChange(group.key, line.key, 'market', event.target.value)
                }
                placeholder="Hándicap europeo"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor={fieldId('custom-selection')} className={labelClass}>
                Selección libre
              </label>
              <input
                id={fieldId('custom-selection')}
                type="text"
                value={line.selection}
                onChange={(event) =>
                  onFieldChange(
                    group.key,
                    line.key,
                    'selection',
                    event.target.value,
                  )
                }
                placeholder="Local -1"
                className={inputClass}
                required
              />
            </div>
          </div>
        )}

        {market && market.inputType !== MARKET_INPUT.CUSTOM && (
          <SelectionFields
            line={line}
            market={market}
            home={group.home}
            away={group.away}
            onChange={(data) =>
              onSelectionChange(group.key, line.key, data)
            }
          />
        )}

        {lineMode && (
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
                onFieldChange(group.key, line.key, 'odds', event.target.value)
              }
              placeholder="1.60"
              className={inputClass}
              required
            />
          </div>
        )}
      </div>
    </div>
  )
}

function GroupFields({
  group,
  groupIndex,
  sport,
  combo,
  lineMode,
  groupOddsMode,
  onGroupChange,
  onMarketChange,
  onLineChange,
  onSelectionChange,
  onAddLine,
  onRemoveLine,
}) {
  const fieldId = (field) => `group-${group.key}-${field}`
  const lines = combo ? group.lines : group.lines.slice(0, 1)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('home')} className={labelClass}>
            Local
          </label>
          <input
            id={fieldId('home')}
            type="text"
            value={group.home}
            onChange={(event) =>
              onGroupChange(group.key, 'home', event.target.value)
            }
            placeholder="Barcelona"
            className={inputClass}
            autoFocus={groupIndex === 0}
            required
          />
        </div>
        <div>
          <label htmlFor={fieldId('away')} className={labelClass}>
            Visitante
          </label>
          <input
            id={fieldId('away')}
            type="text"
            value={group.away}
            onChange={(event) =>
              onGroupChange(group.key, 'away', event.target.value)
            }
            placeholder="Aston Villa"
            className={inputClass}
          />
        </div>
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
            onGroupChange(group.key, 'competition', event.target.value)
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
            group={group}
            sport={sport}
            canRemove={group.lines.length > 1}
            lineMode={lineMode}
            onMarketChange={onMarketChange}
            onFieldChange={onLineChange}
            onSelectionChange={onSelectionChange}
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

      {groupOddsMode && (
        <div>
          <label htmlFor={fieldId('group-odds')} className={labelClass}>
            Cuota combinada del partido
          </label>
          <input
            id={fieldId('group-odds')}
            type="number"
            inputMode="decimal"
            min="1.01"
            step="0.01"
            value={group.odds}
            onChange={(event) =>
              onGroupChange(group.key, 'odds', event.target.value)
            }
            placeholder="3.40"
            className={inputClass}
            required
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Cuota que paga la casa por combinar todas las selecciones de este
            partido.
          </p>
        </div>
      )}
    </div>
  )
}

export function QuickBetForm({ bet, onAdd, onUpdate, onClose }) {
  const isEditing = Boolean(bet)
  const [sport, setSport] = useState(
    () => bet?.sport ?? SPORTS.FOOTBALL,
  )
  const [mode, setMode] = useState(() =>
    bet && (bet.legs?.length ?? 0) > 1 ? 'combo' : 'single',
  )
  const [oddsMode, setOddsMode] = useState(() =>
    bet && (bet.legs?.length ?? 0) > 1 && bet.legs.some((leg) => leg.odds == null)
      ? 'group'
      : 'line',
  )
  const [groups, setGroups] = useState(() =>
    bet ? groupsFromBet(bet) : [createGroup()],
  )
  const [amount, setAmount] = useState(() =>
    bet ? String(bet.stake) : '',
  )
  const [oddsInput, setOddsInput] = useState(() =>
    bet ? String(bet.odds) : '',
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useModal(onClose)

  const lineMode = mode === 'single' || oddsMode === 'line'
  const groupOddsMode = mode === 'combo' && oddsMode === 'group'

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')

    if (nextMode === 'single') {
      setOddsMode('line')
      setGroups((previous) => [
        {
          ...previous[0],
          odds: '',
          lines: previous[0].lines.slice(0, 1),
        },
      ])
    }
  }

  function changeOddsMode(nextMode) {
    setOddsMode(nextMode)
    setError('')
  }

  function changeSport(nextSport) {
    if (nextSport === sport) return

    const hasSelections = groups.some((group) =>
      group.lines.some(
        (line) => line.marketKey || line.market.trim() || line.selection.trim(),
      ),
    )

    if (
      hasSelections &&
      !window.confirm(
        'Cambiar de deporte borrará los mercados y selecciones introducidos. ¿Continuar?',
      )
    ) {
      return
    }

    setSport(nextSport)
    setError('')
    setGroups((previous) =>
      previous.map((group) => ({
        ...group,
        lines: group.lines.map((line) => ({
          ...line,
          marketKey: '',
          market: '',
          selection: '',
          selectionData: null,
        })),
      })),
    )
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

  function updateMarket(groupKey, lineKey, marketKey) {
    const market = findMarket(marketKey, sport)

    setGroups((previous) =>
      previous.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              lines: group.lines.map((line) =>
                line.key === lineKey
                  ? {
                      ...line,
                      marketKey,
                      market: '',
                      selection: '',
                      selectionData: defaultSelection(market),
                    }
                  : line,
              ),
            }
          : group,
      ),
    )
    setError('')
  }

  function updateSelection(groupKey, lineKey, selectionData) {
    setGroups((previous) =>
      previous.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              lines: group.lines.map((line) =>
                line.key === lineKey
                  ? { ...line, selectionData }
                  : line,
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
      const home = group.home.trim()
      const away = group.away.trim()
      const competition = group.competition.trim()
      const match = formatMatch(home, away)

      if (!home || !competition) {
        setError(
          `Completa local y competición en el partido ${groupIndex + 1}.`,
        )
        return
      }

      if (groupOddsMode) {
        const groupOdds = Number(group.odds)
        if (!Number.isFinite(groupOdds) || groupOdds <= 1) {
          setError(
            `La cuota combinada del partido ${groupIndex + 1} debe ser mayor que 1.`,
          )
          return
        }
      }

      const lines = mode === 'combo' ? group.lines : group.lines.slice(0, 1)

      if (lines.length === 0) {
        setError(`Agrega al menos una selección en el partido ${groupIndex + 1}.`)
        return
      }

      for (const [lineIndex, line] of lines.entries()) {
        const market = findMarket(line.marketKey, sport)

        if (!market) {
          setError(
            `Selecciona un mercado en la selección ${lineIndex + 1} del partido ${groupIndex + 1}.`,
          )
          return
        }

        let marketLabel = market.label
        let selectionLabel
        let selectionData = line.selectionData

        if (market.inputType === MARKET_INPUT.CUSTOM) {
          marketLabel = line.market.trim()
          selectionLabel = line.selection.trim()

          if (!marketLabel || !selectionLabel) {
            setError(
              `Completa mercado y selección libre en la selección ${lineIndex + 1} del partido ${groupIndex + 1}.`,
            )
            return
          }

          selectionData = null
        } else {
          const selectionError = validateSelection(market, line.selectionData)

          if (selectionError) {
            setError(
              `Selección ${lineIndex + 1} del partido ${groupIndex + 1}: ${selectionError}`,
            )
            return
          }

          selectionLabel = buildSelectionText(market, line.selectionData, {
            home,
            away,
          })
        }

        let legOdds = null

        if (lineMode) {
          legOdds = Number(line.odds)
          if (!Number.isFinite(legOdds) || legOdds <= 1) {
            setError(
              `La cuota de la selección ${lineIndex + 1} del partido ${groupIndex + 1} debe ser mayor que 1.`,
            )
            return
          }
        }

        normalizedLegs.push({
          id: createId(),
          match,
          competition,
          market: marketLabel,
          selection: selectionLabel,
          odds: lineMode ? legOdds : null,
          groupOdds: groupOddsMode ? Number(group.odds) : null,
          marketKey:
            market.inputType === MARKET_INPUT.CUSTOM ? null : line.marketKey,
          selectionData,
        })
      }
    }

    const combinedOdds = groupOddsMode
      ? productOdds(activeGroups.map((group) => group.odds))
      : productOdds(normalizedLegs.map((leg) => leg.odds))
    const effectiveOdds =
      oddsInput.trim() === '' ? combinedOdds : Number(oddsInput)

    if (!Number.isFinite(effectiveOdds) || effectiveOdds <= 1) {
      setError('La cuota total debe ser mayor que 1.')
      return
    }

    const payload = {
      sport,
      legs: normalizedLegs,
      odds: Number(effectiveOdds.toFixed(2)),
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
  const autoOdds = productOdds(
    groupOddsMode
      ? visibleGroups.map((group) => group.odds)
      : activeLines.map((line) => line.odds),
  )
  const manualOdds = oddsInput.trim() === '' ? null : Number(oddsInput)
  const effectiveOdds = manualOdds === null ? autoOdds : manualOdds
  const oddsValid = Number.isFinite(effectiveOdds) && effectiveOdds > 1
  const stake = Number(amount)
  const potentialReturn =
    Number.isFinite(stake) && stake > 0 && oddsValid
      ? stake * effectiveOdds
      : 0

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
            <p className={labelClass}>Deporte</p>
            <div
              className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1"
              role="group"
              aria-label="Deporte"
            >
              {SPORT_OPTIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => changeSport(item.key)}
                  aria-pressed={sport === item.key}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    sport === item.key
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

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

          {mode === 'combo' && (
            <div>
              <p className={labelClass}>Cuotas de la combinada</p>
              <div
                className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1"
                role="group"
                aria-label="Modo de cuotas"
              >
                {ODDS_MODES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => changeOddsMode(item.key)}
                    aria-pressed={oddsMode === item.key}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      oddsMode === item.key
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  sport={sport}
                  combo={mode === 'combo'}
                  lineMode={lineMode}
                  groupOddsMode={groupOddsMode}
                  onGroupChange={updateGroup}
                  onMarketChange={updateMarket}
                  onLineChange={updateLine}
                  onSelectionChange={updateSelection}
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

          <div className="space-y-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="total-odds"
                className="text-sm font-medium text-indigo-900/80 dark:text-indigo-100/80"
              >
                Cuota total
              </label>
              {oddsInput !== '' && (
                <button
                  type="button"
                  onClick={() => {
                    setOddsInput('')
                    setError('')
                  }}
                  className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  Usar automática
                </button>
              )}
            </div>

            <input
              id="total-odds"
              type="number"
              inputMode="decimal"
              min="1.01"
              step="0.01"
              value={oddsInput}
              onChange={(event) => {
                setOddsInput(event.target.value)
                setError('')
              }}
              placeholder={autoOdds > 1 ? autoOdds.toFixed(2) : '1.00'}
              className={inputClass}
            />

            <p className="text-xs text-indigo-900/60 dark:text-indigo-100/60">
              {oddsInput === ''
                ? `Calculada automáticamente: ${autoOdds.toFixed(2)}`
                : `Automática: ${autoOdds.toFixed(2)} · Ajustada manualmente`}
            </p>

            <p className="text-xs text-indigo-900/60 dark:text-indigo-100/60">
              {groupOddsMode
                ? 'La automática es el producto de las cuotas combinadas de cada partido.'
                : 'La automática es el producto de las cuotas de cada selección.'}
            </p>

            <p className="text-xs text-indigo-900/60 dark:text-indigo-100/60">
              Edítala si tu casa aplica ajustes, por ejemplo en combinadas del
              mismo partido.
            </p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-900/70 dark:text-indigo-100/70">
                Retorno potencial
              </span>
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                {formatCurrency(potentialReturn)}
              </span>
            </div>
          </div>

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
