import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { productOdds } from '../src/lib/bets.js'
import {
  MARKET_INPUT,
  SPORTS,
  buildSelectionText,
  defaultSelection,
  findMarket,
  findMarketByLabel,
  formatMatch,
  marketCategoriesForSport,
  parseMatch,
  validateSelection,
} from '../src/lib/markets.js'

describe('parseMatch', () => {
  it('splits a classic "vs" match', () => {
    assert.deepEqual(parseMatch('Barcelona vs Aston Villa'), {
      home: 'Barcelona',
      away: 'Aston Villa',
    })
  })

  it('is case insensitive and tolerates "vs."', () => {
    assert.deepEqual(parseMatch('Real Madrid VS. Sevilla'), {
      home: 'Real Madrid',
      away: 'Sevilla',
    })
  })

  it('keeps the whole string as home when there is no separator', () => {
    assert.deepEqual(parseMatch('Barcelona'), {
      home: 'Barcelona',
      away: '',
    })
  })
})

describe('formatMatch', () => {
  it('joins home and away', () => {
    assert.equal(formatMatch('Barcelona', 'Aston Villa'), 'Barcelona vs Aston Villa')
  })

  it('returns the home team when away is empty', () => {
    assert.equal(formatMatch('Barcelona', ''), 'Barcelona')
  })
})

describe('market catalog', () => {
  it('finds markets by key and label', () => {
    assert.equal(findMarket('ambos_marcan')?.inputType, MARKET_INPUT.YES_NO)
    assert.equal(findMarketByLabel('Ambos marcan')?.key, 'ambos_marcan')
  })

  it('returns null for unknown markets', () => {
    assert.equal(findMarket('no_existe'), null)
  })

  it('exposes different categories per sport', () => {
    const footballKeys = marketCategoriesForSport(SPORTS.FOOTBALL).flatMap(
      (category) => category.markets.map((market) => market.key),
    )
    const basketballKeys = marketCategoriesForSport(SPORTS.BASKETBALL).flatMap(
      (category) => category.markets.map((market) => market.key),
    )

    assert.ok(footballKeys.includes('ganador'))
    assert.ok(footballKeys.includes('total_goles'))
    assert.ok(basketballKeys.includes('basket_ganador'))
    assert.ok(basketballKeys.includes('basket_total_puntos'))
    assert.ok(basketballKeys.includes('basket_jugador_pra'))
    assert.ok(!basketballKeys.includes('total_goles'))
  })

  it('finds basketball markets by key', () => {
    assert.equal(
      findMarket('basket_total_puntos')?.inputType,
      MARKET_INPUT.OVER_UNDER,
    )
    assert.equal(
      findMarket('basket_jugador_puntos')?.inputType,
      MARKET_INPUT.PLAYER_OVER_UNDER,
    )
  })
})

describe('selection text', () => {
  it('uses team names for winner and double chance', () => {
    const teams = { home: 'Barcelona', away: 'Aston Villa' }

    assert.equal(
      buildSelectionText(findMarket('ganador'), { value: 'home' }, teams),
      'Barcelona',
    )
    assert.equal(
      buildSelectionText(findMarket('ganador'), { value: 'draw' }, teams),
      'Empate',
    )
    assert.equal(
      buildSelectionText(findMarket('doble_oportunidad'), { value: '12' }, teams),
      'Barcelona o Aston Villa',
    )
  })

  it('builds yes/no and over/under selections', () => {
    assert.equal(
      buildSelectionText(findMarket('ambos_marcan'), { value: 'no' }),
      'No',
    )
    assert.equal(
      buildSelectionText(findMarket('total_goles'), {
        direction: 'over',
        line: '2.5',
      }),
      'Más de 2.5',
    )
    assert.equal(
      buildSelectionText(findMarket('total_goles'), {
        direction: 'under',
        line: 3,
      }),
      'Menos de 3',
    )
  })

  it('builds range and player selections', () => {
    assert.equal(
      buildSelectionText(findMarket('rango_goles'), { min: 2, max: 3 }),
      'Entre 2 y 3 goles',
    )
    assert.equal(
      buildSelectionText(findMarket('anota_local'), { player: 'Messi' }),
      'Messi',
    )
  })

  it('builds basketball winner and player prop selections', () => {
    const teams = { home: 'Lakers', away: 'Celtics' }

    assert.equal(
      buildSelectionText(
        findMarket('basket_ganador', SPORTS.BASKETBALL),
        { value: 'away' },
        teams,
      ),
      'Celtics',
    )

    assert.equal(
      buildSelectionText(
        findMarket('basket_jugador_puntos', SPORTS.BASKETBALL),
        { player: 'LeBron James', direction: 'over', line: '24.5' },
      ),
      'LeBron James · Más de 24.5',
    )
  })
})

describe('selection validation', () => {
  it('requires a line for over/under markets', () => {
    assert.match(
      validateSelection(findMarket('total_goles'), {
        direction: 'over',
        line: '',
      }),
      /línea válida/,
    )
    assert.equal(
      validateSelection(findMarket('total_goles'), {
        direction: 'over',
        line: '1.5',
      }),
      '',
    )
  })

  it('requires min lower or equal than max', () => {
    assert.match(
      validateSelection(findMarket('rango_goles'), { min: 3, max: 2 }),
      /rango válido/,
    )
    assert.equal(
      validateSelection(findMarket('rango_goles'), { min: 2, max: 3 }),
      '',
    )
  })

  it('requires a player name', () => {
    assert.match(
      validateSelection(findMarket('anota_local'), { player: '' }),
      /jugador/,
    )
  })

  it('does not allow a draw for basketball winners', () => {
    const market = findMarket('basket_ganador', SPORTS.BASKETBALL)

    assert.match(validateSelection(market, { value: 'draw' }), /resultado/)
    assert.equal(validateSelection(market, { value: 'away' }), '')
  })

  it('requires player and line for player props', () => {
    const market = findMarket('basket_jugador_puntos', SPORTS.BASKETBALL)

    assert.match(
      validateSelection(market, {
        player: '',
        direction: 'over',
        line: '24.5',
      }),
      /jugador/,
    )
    assert.match(
      validateSelection(market, {
        player: 'LeBron James',
        direction: 'over',
        line: '',
      }),
      /línea válida/,
    )
    assert.equal(
      validateSelection(market, {
        player: 'LeBron James',
        direction: 'under',
        line: '24.5',
      }),
      '',
    )
  })
})

describe('defaultSelection', () => {
  it('returns initial values per input type', () => {
    assert.deepEqual(defaultSelection(findMarket('ganador')), { value: 'home' })
    assert.deepEqual(defaultSelection(findMarket('total_goles')), {
      direction: 'over',
      line: '',
    })
    assert.deepEqual(defaultSelection(findMarket('rango_goles')), {
      min: '',
      max: '',
    })
    assert.deepEqual(defaultSelection(findMarket('anota_local')), {
      player: '',
    })
    assert.deepEqual(
      defaultSelection(findMarket('basket_jugador_puntos', SPORTS.BASKETBALL)),
      { player: '', direction: 'over', line: '' },
    )
    assert.equal(defaultSelection(findMarket('otro')), null)
  })
})

describe('productOdds', () => {
  it('multiplies only valid odds', () => {
    assert.equal(productOdds([2, 1.5, 3]), 9)
    assert.equal(productOdds([2, '', 3, null, 0.5]), 6)
  })

  it('returns 1 with no valid values', () => {
    assert.equal(productOdds([]), 1)
  })
})
