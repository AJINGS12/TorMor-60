// Points, streak multiplier, speed bonus and rank lookup — all values from
// config.scoring / config.ranks in game-rules.json.
import { config, ranks, scoringConfig as s } from './rules.ts'
import type { Outcome, Rank, ScoreBreakdown } from './types.ts'

/** floor(secondsLeft / timePerTravellerSec * speedBonusMax), clamped to the timer. */
export function speedBonus(secondsLeft: number): number {
  const t = config.timePerTravellerSec
  const clamped = Math.min(Math.max(secondsLeft, 0), t)
  return Math.floor((clamped / t) * s.speedBonusMax)
}

/** Multiplier applied once the streak (including this round) reaches the threshold. */
export function streakMultiplier(streak: number): number {
  return streak >= s.streakThreshold ? s.streakMultiplier : 1
}

export function nextStreak(streakBefore: number, outcome: Outcome): number {
  return outcome === 'correct' ? streakBefore + 1 : 0
}

export function isStrike(outcome: Outcome): boolean {
  const key = outcome === 'wrong' ? 'wrongDecision' : outcome === 'timeout' ? 'timeout' : null
  return key !== null && config.strikeOn.includes(key)
}

export function isFired(strikes: number): boolean {
  return strikes >= config.strikesToFail
}

export interface ScoreRoundInput {
  outcome: Outcome
  denyReasonCorrect: boolean
  askedNecessaryCount: number
  unnecessaryCount: number
  missedCount: number
  secondsLeft: number
  streakBefore: number
}

/**
 * Necessary questions asked always earn points, whatever the decision.
 * Correct decisions also earn decision + reason + other question points +
 * speed bonus, multiplied by the streak multiplier. Wrong decisions and
 * timeouts add the flat config value (wrongDecision / timeout), get no speed
 * bonus or multiplier, and reset the streak.
 */
export function scoreRound(input: ScoreRoundInput): { breakdown: ScoreBreakdown; streakAfter: number } {
  const streakAfter = nextStreak(input.streakBefore, input.outcome)
  const necessaryQuestions = input.askedNecessaryCount * s.necessaryQuestionAsked

  if (input.outcome !== 'correct') {
    const penalty = input.outcome === 'timeout' ? s.timeout : s.wrongDecision
    const subtotal = necessaryQuestions + penalty
    return {
      streakAfter,
      breakdown: {
        correctDecision: 0,
        correctDenyReason: 0,
        necessaryQuestions,
        unnecessaryQuestions: 0,
        missedQuestions: 0,
        speedBonus: 0,
        penalty,
        subtotal,
        streakMultiplier: 1,
        total: subtotal,
      },
    }
  }

  const parts = {
    correctDecision: s.correctDecision,
    correctDenyReason: input.denyReasonCorrect ? s.correctDenyReason : 0,
    necessaryQuestions,
    unnecessaryQuestions: input.unnecessaryCount * s.unnecessaryQuestionAsked,
    missedQuestions: input.missedCount * s.missedNecessaryQuestion,
    speedBonus: speedBonus(input.secondsLeft),
    penalty: 0,
  }
  const subtotal = Object.values(parts).reduce((a, b) => a + b, 0)
  const multiplier = streakMultiplier(streakAfter)

  return {
    streakAfter,
    breakdown: { ...parts, subtotal, streakMultiplier: multiplier, total: Math.floor(subtotal * multiplier) },
  }
}

/** Highest rank whose minScore is ≤ score. */
export function rankFor(score: number): Rank {
  let rank = ranks[0]
  for (const r of ranks) if (score >= r.minScore) rank = r
  return rank
}
