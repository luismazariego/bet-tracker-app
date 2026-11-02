import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  STATUS,
  betProfit,
  betSummary,
  calcStats,
  formatCurrency,
  formatSignedCurrency,
} from '../src/lib/bets.js'

function makeBet(overrides = {}) {
  return {
    id: 'bet-1',
    odds: 2,
    stake: 10,
    status: STATUS.PENDING,
    createdAt: '2026-01-01T00:00:00.000Z',
    legs: [
      {
        id: 'leg-1',
        match: 'Equipo A vs Equipo B',
        competition: 'Liga',
        market: 'Resultado final',
        selection: 'Equipo A',
        odds: 2,
      },
    ],
    ...overrides,
  }
}

describe('betProfit', () => {
  it('returns zero for pending bets', () => {
    assert.equal(betProfit(makeBet()), 0)
  })

  it('returns net profit for won bets', () => {
    assert.equal(betProfit(makeBet({ status: STATUS.WON })), 10)
  })

  it('returns the full loss for lost bets', () => {
    assert.equal(betProfit(makeBet({ status: STATUS.LOST })), -10)
  })

  it('uses the cash out amount for cashed out bets', () => {
    assert.equal(
      betProfit(makeBet({ status: STATUS.CASHOUT, cashOut: 15 })),
      5,
    )
  })

  it('treats a missing cash out amount as zero', () => {
    assert.equal(
      betProfit(makeBet({ status: STATUS.CASHOUT, cashOut: undefined })),
      -10,
    )
  })
})

describe('betSummary', () => {
  it('describes a single bet', () => {
    const summary = betSummary(makeBet())

    assert.equal(summary.isCombo, false)
    assert.equal(summary.title, 'Equipo A vs Equipo B')
    assert.match(summary.subtitle, /Liga · Resultado final · Equipo A/)
  })

  it('normalizes legacy bets without legs', () => {
    const summary = betSummary({
      id: 'legacy',
      match: 'X vs Y',
      competition: 'Copa',
      market: 'Ganador',
      selection: 'X',
      odds: 1.5,
    })

    assert.equal(summary.isCombo, false)
    assert.equal(summary.legs.length, 1)
    assert.equal(summary.title, 'X vs Y')
  })

  it('marks multi-leg bets as combos', () => {
    const summary = betSummary(
      makeBet({
        legs: [
          makeBet().legs[0],
          {
            id: 'leg-2',
            match: 'Equipo C vs Equipo D',
            competition: 'Liga',
            market: 'Ambos marcan',
            selection: 'Sí',
            odds: 1.8,
          },
        ],
      }),
    )

    assert.equal(summary.isCombo, true)
    assert.match(summary.title, /Combinada · 2 selecciones/)
  })

  it('groups legs from the same match', () => {
    const base = makeBet().legs[0]
    const summary = betSummary(
      makeBet({
        legs: [base, { ...base, id: 'leg-2', selection: 'Empate' }],
      }),
    )

    assert.equal(summary.isCombo, true)
    assert.equal(summary.sameMatch, true)
    assert.match(summary.title, /Combinada · 2 líneas/)
  })
})

describe('calcStats', () => {
  it('aggregates staked amount, profit and counters', () => {
    const stats = calcStats([
      makeBet({ status: STATUS.WON, stake: 10, odds: 2 }),
      makeBet({ id: 'bet-2', status: STATUS.LOST, stake: 20 }),
      makeBet({
        id: 'bet-3',
        status: STATUS.CASHOUT,
        stake: 30,
        cashOut: 45,
      }),
      makeBet({ id: 'bet-4', status: STATUS.PENDING, stake: 40 }),
    ])

    assert.equal(stats.staked, 100)
    assert.equal(stats.profit, 5)
    assert.equal(stats.won, 1)
    assert.equal(stats.lost, 1)
    assert.equal(stats.cashedOut, 1)
    assert.equal(stats.pending, 1)
    assert.equal(stats.settled, 3)
    assert.equal(stats.yieldPct, 5)
    assert.ok(Math.abs(stats.winRate - 100 / 3) < 1e-9)
  })

  it('returns zeroed metrics with no bets', () => {
    const stats = calcStats([])

    assert.equal(stats.staked, 0)
    assert.equal(stats.profit, 0)
    assert.equal(stats.yieldPct, 0)
    assert.equal(stats.winRate, 0)
  })
})

describe('formatting', () => {
  it('formats currency values', () => {
    assert.equal(formatCurrency(12.5), '$12.50')
    assert.equal(formatSignedCurrency(12.5), '+$12.50')
    assert.equal(formatSignedCurrency(-3), '-$3.00')
  })
})
