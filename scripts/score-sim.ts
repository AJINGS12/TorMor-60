// Score simulation: plays many full games with three player types through the real
// engine (generateShift + evaluate) and reports the score spread per rank.
import { generateShift } from '../src/engine/generateTraveller.ts'
import { evaluate, findViolations, getRequirements, questionsFor } from '../src/engine/requirements.ts'
import { config, ranks } from '../src/engine/rules.ts'
import { maxPossibleScore, rankFor } from '../src/engine/scoring.ts'
import type { Decision, Rank, Traveller } from '../src/engine/types.ts'
import { chance, pick, shuffle, type Rng } from '../src/utils/random.ts'

interface Play {
  asked: string[]
  decision: Decision
  denyReasonId: string | null
  secondsLeft: number
}

interface PlayerType {
  name: string
  describe: string
  play: (t: Traveller, rng: Rng) => Play
}

const T = config.timePerTravellerSec
const expectedDecision = (t: Traveller): Decision => (findViolations(t).length ? 'DENY' : 'APPROVE')
const otherReason = (t: Traveller, rng: Rng) => pick(rng, t.denyReasonChoices.filter((id) => id !== t.flaw?.denyReason))

export const PLAYER_TYPES: PlayerType[] = [
  {
    name: 'Perfect',
    describe: 'all needed questions, correct decision + reason, decides after 15 s',
    play: (t) => ({
      asked: getRequirements(t).necessaryQuestionIds,
      decision: expectedDecision(t),
      denyReasonId: t.flaw?.denyReason ?? null,
      secondsLeft: T - 15,
    }),
  },
  {
    name: 'Average',
    describe: '60% of needed questions, correct 70% of the time (decision, and reason when denying), decides after 35 s',
    play: (t, rng) => {
      const needed = getRequirements(t).necessaryQuestionIds
      const right = expectedDecision(t)
      const decision: Decision = chance(rng, 0.7) ? right : right === 'APPROVE' ? 'DENY' : 'APPROVE'
      const reason = decision === 'DENY' ? (t.flaw && chance(rng, 0.7) ? t.flaw.denyReason : otherReason(t, rng)) : null
      return { asked: shuffle(rng, needed).slice(0, Math.round(needed.length * 0.6)), decision, denyReasonId: reason, secondsLeft: T - 35 }
    },
  },
  {
    name: 'Random',
    describe: 'each offered question asked with 50% chance, random decision and reason, decides after 50 s',
    play: (t, rng) => {
      const decision: Decision = chance(rng, 0.5) ? 'APPROVE' : 'DENY'
      return {
        asked: questionsFor(t).map((q) => q.id).filter(() => chance(rng, 0.5)),
        decision,
        denyReasonId: decision === 'DENY' ? pick(rng, t.denyReasonChoices) : null,
        secondsLeft: T - 50,
      }
    },
  },
]

function playGame(type: PlayerType, rng: Rng): number {
  let streak = 0
  let strikes = 0
  let score = 0
  for (const t of generateShift({ rng })) {
    const p = type.play(t, rng)
    const r = evaluate(t, p.decision, p.denyReasonId, p.asked, p.secondsLeft, streak)
    streak = r.streakAfter
    score += r.breakdown.total
    if (r.strike && ++strikes >= config.strikesToFail) break
  }
  return score
}

const percentile = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
const floorTo = (n: number, step: number) => Math.floor(n / step) * step

export interface SimResult {
  type: PlayerType
  scores: number[]
  byRank: Map<Rank, number>
}

export function runScoreSimulation(rng: Rng, games = 1000): void {
  const results: SimResult[] = PLAYER_TYPES.map((type) => {
    const scores = Array.from({ length: games }, () => playGame(type, rng)).sort((a, b) => a - b)
    const byRank = new Map<Rank, number>(ranks.map((r) => [r, 0]))
    for (const s of scores) byRank.set(rankFor(s), (byRank.get(rankFor(s)) ?? 0) + 1)
    return { type, scores, byRank }
  })

  const pct = (n: number) => `${((n / games) * 100).toFixed(1)}%`
  console.log(`Score simulation: ${games} games of ${config.travellersPerGame} travellers per player type`)
  for (const r of results) console.log(`  ${r.type.name.padEnd(8)} ${r.type.describe}`)
  console.table(
    Object.fromEntries(
      results.map((r) => [
        r.type.name,
        {
          min: r.scores[0],
          avg: Math.round(r.scores.reduce((a, b) => a + b, 0) / games),
          median: percentile(r.scores, 0.5),
          max: r.scores[games - 1],
        },
      ]),
    ),
  )
  console.log('Rank distribution:')
  console.table(
    Object.fromEntries(
      ranks.map((rank) => [`${rank.en} (${rank.minScore}+)`, Object.fromEntries(results.map((r) => [r.type.name, pct(r.byRank.get(rank) ?? 0)]))]),
    ),
  )

  // --- Threshold checks ----------------------------------------------------
  const [perfect, average] = results
  const legend = ranks[ranks.length - 1]
  const trainee = ranks[0]
  const legendShare = (perfect.byRank.get(legend) ?? 0) / games
  const traineeShare = (average.byRank.get(trainee) ?? 0) / games
  const legendUnreachable = perfect.scores[games - 1] < legend.minScore
  const averageMostlyTrainee = traineeShare > 0.5

  console.log(`Theoretical max score: ${maxPossibleScore()}`)
  console.log(
    `Check: ${legend.en} reachable by Perfect? ${legendUnreachable ? 'NO' : `yes (${(legendShare * 100).toFixed(1)}% of perfect games)`}` +
      ` · Average mostly ${trainee.en}? ${averageMostlyTrainee ? 'YES' : `no (${(traineeShare * 100).toFixed(1)}%)`}`,
  )

  if (legendUnreachable || averageMostlyTrainee) {
    // Suggestion: top rank at the Perfect player's 25th percentile (most perfect games earn it),
    // second rank at the Average player's 25th percentile, the rest evenly in between.
    const top = floorTo(percentile(perfect.scores, 0.25), 10)
    const low = floorTo(percentile(average.scores, 0.25), 10)
    const steps = ranks.length - 2
    const suggested = ranks.map((_, i) => (i === 0 ? 0 : floorTo(low + ((top - low) * (i - 1)) / steps, 10)))
    console.log('Suggested thresholds: ' + ranks.map((r, i) => `${r.en} ${suggested[i]}`).join(' · '))
  } else {
    console.log('Thresholds OK: no adjustment needed by the rule above.')
  }
  console.log()
}
