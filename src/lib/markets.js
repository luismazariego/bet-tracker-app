export const MARKET_INPUT = {
  WINNER: 'winner',
  DOUBLE_CHANCE: 'doubleChance',
  YES_NO: 'yesNo',
  OVER_UNDER: 'overUnder',
  RANGE: 'range',
  PLAYER: 'player',
  CUSTOM: 'custom',
}

export const CUSTOM_MARKET_KEY = 'otro'

export const MARKET_CATEGORIES = [
  {
    key: 'resultado',
    label: 'Resultado',
    markets: [
      { key: 'ganador', label: 'Ganador', inputType: MARKET_INPUT.WINNER },
      {
        key: 'doble_oportunidad',
        label: 'Doble oportunidad',
        inputType: MARKET_INPUT.DOUBLE_CHANCE,
      },
    ],
  },
  {
    key: 'goles',
    label: 'Goles',
    markets: [
      { key: 'total_goles', label: 'Total goles', inputType: MARKET_INPUT.OVER_UNDER },
      {
        key: 'total_goles_1t',
        label: 'Total goles 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_goles_2t',
        label: 'Total goles 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_goles_local',
        label: 'Total goles local',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_goles_visita',
        label: 'Total goles visita',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_goles_local_1t',
        label: 'Total goles local 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_goles_local_2t',
        label: 'Total goles local 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_goles_visita_1t',
        label: 'Total goles visita 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_goles_visita_2t',
        label: 'Total goles visita 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      { key: 'ambos_marcan', label: 'Ambos marcan', inputType: MARKET_INPUT.YES_NO },
      { key: 'rango_goles', label: 'Rango de goles', inputType: MARKET_INPUT.RANGE },
    ],
  },
  {
    key: 'corners',
    label: 'Corners',
    markets: [
      {
        key: 'total_corners',
        label: 'Total corners',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_corners_1t',
        label: 'Total corners 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_corners_2t',
        label: 'Total corners 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_corners_local_1t',
        label: 'Total corners local 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_corners_local_2t',
        label: 'Total corners local 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_corners_visita_1t',
        label: 'Total corners visita 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_corners_visita_2t',
        label: 'Total corners visita 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
    ],
  },
  {
    key: 'remates',
    label: 'Remates',
    markets: [
      { key: 'total_remates', label: 'Total remates', inputType: MARKET_INPUT.OVER_UNDER },
      { key: 'remates_local', label: 'Remates local', inputType: MARKET_INPUT.OVER_UNDER },
      {
        key: 'remates_visita',
        label: 'Remates visitante',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_local_1t',
        label: 'Remates local 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_visita_1t',
        label: 'Remates visitante 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_local_2t',
        label: 'Remates local 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_visita_2t',
        label: 'Remates visitante 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
    ],
  },
  {
    key: 'remates_arco',
    label: 'Remates al arco',
    markets: [
      {
        key: 'total_remates_arco',
        label: 'Total remates al arco',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_arco_local',
        label: 'Remates al arco local',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_arco_visita',
        label: 'Remates al arco visita',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_arco_local_1t',
        label: 'Remates al arco local 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_arco_visita_1t',
        label: 'Remates al arco visita 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_arco_local_2t',
        label: 'Remates al arco local 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'remates_arco_visita_2t',
        label: 'Remates al arco visita 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
    ],
  },
  {
    key: 'tarjetas',
    label: 'Tarjetas',
    markets: [
      {
        key: 'total_tarjetas',
        label: 'Total de tarjetas',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_tarjetas_local',
        label: 'Total de tarjetas local',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_tarjetas_visita',
        label: 'Total de tarjetas visita',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_tarjetas_local_1t',
        label: 'Total de tarjetas local 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_tarjetas_visita_1t',
        label: 'Total de tarjetas visita 1ra mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_tarjetas_local_2t',
        label: 'Total de tarjetas local 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'total_tarjetas_visita_2t',
        label: 'Total de tarjetas visita 2da mitad',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'ambos_1_tarjeta',
        label: 'Ambos equipos reciben 1 tarjeta',
        inputType: MARKET_INPUT.YES_NO,
      },
      {
        key: 'ambos_2_tarjetas',
        label: 'Ambos equipos reciben 2 tarjetas o más',
        inputType: MARKET_INPUT.YES_NO,
      },
    ],
  },
  {
    key: 'especiales',
    label: 'Especiales',
    markets: [
      {
        key: 'local_gana_cualquier_mitad',
        label: 'Local gana cualquier mitad',
        inputType: MARKET_INPUT.YES_NO,
      },
      {
        key: 'visita_gana_cualquier_mitad',
        label: 'Visita gana cualquier mitad',
        inputType: MARKET_INPUT.YES_NO,
      },
      {
        key: 'local_anota_ambas_mitades',
        label: 'Local anota en ambas mitades',
        inputType: MARKET_INPUT.YES_NO,
      },
      {
        key: 'visita_anota_ambas_mitades',
        label: 'Visita anota en ambas mitades',
        inputType: MARKET_INPUT.YES_NO,
      },
      {
        key: 'mas_goles_1t',
        label: '1ra mitad hay más goles',
        inputType: MARKET_INPUT.YES_NO,
      },
      {
        key: 'mas_goles_2t',
        label: '2da mitad hay más goles',
        inputType: MARKET_INPUT.YES_NO,
      },
      {
        key: 'igual_goles_mitades',
        label: 'Igual número de goles en ambas mitades',
        inputType: MARKET_INPUT.YES_NO,
      },
    ],
  },
  {
    key: 'atajadas',
    label: 'Atajadas',
    markets: [
      {
        key: 'atajadas_portero_local',
        label: 'Atajadas portero local',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
      {
        key: 'atajadas_portero_visita',
        label: 'Atajadas portero visita',
        inputType: MARKET_INPUT.OVER_UNDER,
      },
    ],
  },
  {
    key: 'jugador',
    label: 'Jugador',
    markets: [
      { key: 'falta_local', label: 'Le harán falta local', inputType: MARKET_INPUT.PLAYER },
      { key: 'falta_visita', label: 'Le harán falta visita', inputType: MARKET_INPUT.PLAYER },
      { key: 'comete_falta_local', label: 'Comete falta local', inputType: MARKET_INPUT.PLAYER },
      {
        key: 'comete_falta_visita',
        label: 'Comete falta visita',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'anota_o_asiste_local',
        label: 'Anota o asiste local',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'anota_o_asiste_visita',
        label: 'Anota o asiste visita',
        inputType: MARKET_INPUT.PLAYER,
      },
      { key: 'anota_local', label: 'Anota local', inputType: MARKET_INPUT.PLAYER },
      { key: 'anota_visita', label: 'Anota visita', inputType: MARKET_INPUT.PLAYER },
      { key: 'asistencia_local', label: 'Asistencia local', inputType: MARKET_INPUT.PLAYER },
      {
        key: 'asistencia_visita',
        label: 'Asistencia visita',
        inputType: MARKET_INPUT.PLAYER,
      },
      { key: 'amonestado_local', label: 'Es amonestado local', inputType: MARKET_INPUT.PLAYER },
      {
        key: 'amonestado_visita',
        label: 'Es amonestado visita',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'remate_arco_jugador_local',
        label: 'Remate al arco jugador local',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'remate_arco_jugador_visita',
        label: 'Remate al arco jugador visita',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'remates_jugador_local',
        label: 'Remates jugador local',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'remates_jugador_visita',
        label: 'Remates jugador visita',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'entradas_jugador_local',
        label: 'Entradas jugador local',
        inputType: MARKET_INPUT.PLAYER,
      },
      {
        key: 'entradas_jugador_visita',
        label: 'Entradas jugador visita',
        inputType: MARKET_INPUT.PLAYER,
      },
    ],
  },
  {
    key: 'otro',
    label: 'Otro',
    markets: [
      {
        key: CUSTOM_MARKET_KEY,
        label: 'Otro mercado',
        inputType: MARKET_INPUT.CUSTOM,
      },
    ],
  },
]

const MARKET_MAP = new Map()

for (const category of MARKET_CATEGORIES) {
  for (const market of category.markets) {
    MARKET_MAP.set(market.key, { ...market, category: category.label })
  }
}

export function findMarket(key) {
  if (!key) return null
  return MARKET_MAP.get(key) ?? null
}

export function marketByKey(key) {
  return findMarket(key)
}

export function findMarketByLabel(label) {
  const normalized = String(label ?? '').trim().toLowerCase()
  if (!normalized) return null

  for (const market of MARKET_MAP.values()) {
    if (market.label.toLowerCase() === normalized) return market
  }

  return null
}

export function defaultSelection(market) {
  if (!market) return null

  switch (market.inputType) {
    case MARKET_INPUT.WINNER:
      return { value: 'home' }
    case MARKET_INPUT.DOUBLE_CHANCE:
      return { value: '1X' }
    case MARKET_INPUT.YES_NO:
      return { value: 'yes' }
    case MARKET_INPUT.OVER_UNDER:
      return { direction: 'over', line: '' }
    case MARKET_INPUT.RANGE:
      return { min: '', max: '' }
    case MARKET_INPUT.PLAYER:
      return { player: '' }
    default:
      return null
  }
}

function teamName(value, fallback) {
  const name = String(value ?? '').trim()
  return name || fallback
}

export function buildSelectionText(market, data, teams = {}) {
  if (!market) return ''
  const value = data ?? {}
  const home = teamName(teams.home, 'Local')
  const away = teamName(teams.away, 'Visita')

  switch (market.inputType) {
    case MARKET_INPUT.WINNER:
      if (value.value === 'home') return home
      if (value.value === 'away') return away
      return 'Empate'
    case MARKET_INPUT.DOUBLE_CHANCE:
      if (value.value === '12') return `${home} o ${away}`
      if (value.value === 'X2') return `Empate o ${away}`
      return `${home} o Empate`
    case MARKET_INPUT.YES_NO:
      return value.value === 'no' ? 'No' : 'Sí'
    case MARKET_INPUT.OVER_UNDER: {
      const prefix = value.direction === 'under' ? 'Menos de' : 'Más de'
      return `${prefix} ${value.line ?? ''}`.trim()
    }
    case MARKET_INPUT.RANGE:
      return `Entre ${value.min ?? ''} y ${value.max ?? ''} goles`
    case MARKET_INPUT.PLAYER:
      return String(value.player ?? '').trim()
    default:
      return ''
  }
}

export function validateSelection(market, data) {
  if (!market) return 'Selecciona un mercado.'

  const value = data ?? {}

  switch (market.inputType) {
    case MARKET_INPUT.WINNER:
      return ['home', 'draw', 'away'].includes(value.value)
        ? ''
        : 'Elige un resultado.'
    case MARKET_INPUT.DOUBLE_CHANCE:
      return ['1X', '12', 'X2'].includes(value.value)
        ? ''
        : 'Elige una doble oportunidad.'
    case MARKET_INPUT.YES_NO:
      return ['yes', 'no'].includes(value.value) ? '' : 'Elige Sí o No.'
    case MARKET_INPUT.OVER_UNDER: {
      if (!['over', 'under'].includes(value.direction)) {
        return 'Elige Más de o Menos de.'
      }
      if (value.line === '' || value.line == null) {
        return 'Introduce una línea válida.'
      }
      const line = Number(value.line)
      return Number.isFinite(line) && line >= 0
        ? ''
        : 'Introduce una línea válida.'
    }
    case MARKET_INPUT.RANGE: {
      if (
        value.min === '' ||
        value.min == null ||
        value.max === '' ||
        value.max == null
      ) {
        return 'Introduce un rango válido (mínimo menor o igual al máximo).'
      }
      const min = Number(value.min)
      const max = Number(value.max)
      if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
        return 'Introduce un rango válido (mínimo menor o igual al máximo).'
      }
      return ''
    }
    case MARKET_INPUT.PLAYER:
      return String(value.player ?? '').trim()
        ? ''
        : 'Introduce el nombre o número del jugador.'
    default:
      return ''
  }
}

export function parseMatch(match) {
  const value = String(match ?? '').trim()
  if (!value) return { home: '', away: '' }

  const parts = value.split(/\s+vs\.?\s+/i)
  if (parts.length >= 2) {
    return {
      home: parts[0].trim(),
      away: parts.slice(1).join(' vs ').trim(),
    }
  }

  return { home: value, away: '' }
}

export function formatMatch(home, away) {
  const local = String(home ?? '').trim()
  const visitor = String(away ?? '').trim()

  if (local && visitor) return `${local} vs ${visitor}`
  return local || visitor
}
