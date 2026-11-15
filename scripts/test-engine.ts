// Engine smoke test: npm run test:engine [count] [seed]
// Generates travellers and checks that valid ones evaluate as APPROVE and
// flawed ones as DENY with the flaw's deny reason.
import { generateShift, generateTraveller } from '../src/engine/generateTraveller.ts'
import { evaluate, findViolations, getRequirements, questionsFor } from '../src/engine/requirements.ts'
import { flaws, questions, rules } from '../src/engine/rules.ts'
import { maxPossibleScore, rankFor } from '../src/engine/scoring.ts'
import { createRng } from '../src/utils/random.ts'
import type { Traveller } from '../src/engine/types.ts'

const COUNT = Number(process.argv[2] ?? 200)
const SEED = Number(process.argv[3] ?? Date.now() % 1_000_000)
const rng = createRng(SEED)

const failures: string[] = []
const byCountry = new Map<string, { total: number; flawed: number }>()
const byFlaw = new Map<string, number>([['(none)', 0], ...flaws.map((f) => [f.id, 0] as [string, number])])

function fail(t: Traveller, msg: string) {
  failures.push(`${t.id} ${t.country.code} ${t.purpose} ${t.stayDays}d flaw=${t.flaw?.id ?? 'none'}: ${msg}`)
}

for (let i = 0; i < COUNT; i++) {
  const t = generateTraveller({ rng, id: `#${i + 1}` })
  const req = getRequirements(t)
  const all = req.necessaryQuestionIds
  const timeLeft = rules.config.timePerTravellerSec / 2

  const c = byCountry.get(t.country.code) ?? { total: 0, flawed: 0 }
  c.total++
  if (t.flaw) c.flawed++
  byCountry.set(t.country.code, c)
  byFlaw.set(t.flaw?.id ?? '(none)', (byFlaw.get(t.flaw?.id ?? '(none)') ?? 0) + 1)

  const violations = findViolations(t)

  // Every needed question must be one the player can actually ask.
  const offered = questionsFor(t).map((q) => q.id)
  const hidden = all.filter((q) => !offered.includes(q))
  if (hidden.length) fail(t, `necessary questions not offered: ${hidden.join(', ')}`)
  // Students: acceptance letter required and asked about; nobody else sees that question.
  const isStudy = t.purpose === 'study'
  if (isStudy !== req.requiredDocuments.includes('school_letter')) fail(t, 'school_letter requirement does not match purpose')
  if (isStudy !== offered.includes('q_study_docs')) fail(t, 'q_study_docs visibility does not match purpose')
  if (isStudy !== all.includes('q_study_docs')) fail(t, 'q_study_docs necessity does not match purpose')
  if (isStudy && !t.flaw && !t.documents.school_letter) fail(t, 'valid student has no acceptance letter')

  if (!t.flaw) {
    if (violations.length) fail(t, `valid traveller has violations: ${violations.map((v) => v.flawId).join(', ')}`)
    const r = evaluate(t, 'APPROVE', null, all, timeLeft)
    if (r.outcome !== 'correct') fail(t, `APPROVE evaluated as ${r.outcome}`)
    if (evaluate(t, 'DENY', t.denyReasonChoices[0], all, timeLeft).outcome !== 'wrong') fail(t, 'DENY was not wrong')
  } else {
    const ids = violations.map((v) => v.flawId)
    if (ids.length !== 1 || ids[0] !== t.flaw.id) fail(t, `expected exactly [${t.flaw.id}], got [${ids.join(', ')}]`)
    const r = evaluate(t, 'DENY', t.flaw.denyReason, all, timeLeft)
    if (r.outcome !== 'correct') fail(t, `DENY evaluated as ${r.outcome}`)
    if (r.correctDenyReasonIds.length !== 1 || r.correctDenyReasonIds[0] !== t.flaw.denyReason) {
      fail(t, `expected only reason ${t.flaw.denyReason}, got [${r.correctDenyReasonIds.join(', ')}]`)
    }
    if (!r.denyReasonCorrect) fail(t, `deny reason ${t.flaw.denyReason} not accepted (expected ${r.correctDenyReasonIds})`)
    if (evaluate(t, 'APPROVE', null, all, timeLeft).outcome !== 'wrong') fail(t, 'APPROVE was not wrong')
    if (!t.denyReasonChoices.includes(t.flaw.denyReason)) fail(t, 'correct reason missing from deny choices')
  }

  if (t.denyReasonChoices.length !== rules.denyReasonChoices.count) fail(t, `got ${t.denyReasonChoices.length} deny choices`)
  for (const q of questions) {
    const a = t.answers[q.id]
    if (!a || /\{\w+\}/.test(a.text.en + a.text.th)) fail(t, `bad answer for ${q.id}: ${JSON.stringify(a)}`)
  }
  // Necessary-question points are awarded even on a timeout or wrong call; no speed bonus or multiplier.
  const qPoints = all.length * rules.config.scoring.necessaryQuestionAsked
  const timeout = evaluate(t, 'TIMEOUT', null, all, 0)
  if (timeout.outcome !== 'timeout') fail(t, 'TIMEOUT not reported as timeout')
  if (timeout.breakdown.total !== qPoints + rules.config.scoring.timeout) fail(t, `timeout scored ${timeout.breakdown.total}`)
  const wrong = evaluate(t, t.flaw ? 'APPROVE' : 'DENY', null, all, timeLeft, 5)
  if (wrong.breakdown.total !== qPoints + rules.config.scoring.wrongDecision || wrong.breakdown.speedBonus !== 0) {
    fail(t, `wrong decision scored ${JSON.stringify(wrong.breakdown)}`)
  }
}

// --- Report ----------------------------------------------------------------
console.log(`Generated ${COUNT} travellers (seed ${SEED})\n`)

console.log('By country:')
console.table(
  Object.fromEntries([...byCountry].sort().map(([code, v]) => [code, { total: v.total, flawed: v.flawed, valid: v.total - v.flawed }])),
)

console.log('By flaw:')
console.table(Object.fromEntries([...byFlaw].map(([id, n]) => [id, { count: n }])))

const unseen = [...byFlaw].filter(([id, n]) => n === 0 && id !== '(none)').map(([id]) => id)
if (unseen.length) console.warn(`Note: flaws not generated this run: ${unseen.join(', ')}`)

// Scoring sanity: a perfect 5-round streak.
let streak = 0
let score = 0
for (let i = 0; i < rules.config.travellersPerGame; i++) {
  const t = generateTraveller({ rng, forceFlawId: null })
  const r = evaluate(t, 'APPROVE', null, getRequirements(t).necessaryQuestionIds, rules.config.timePerTravellerSec, streak)
  streak = r.streakAfter
  score += r.breakdown.total
}
console.log(`Perfect shift (max speed): ${score} pts → ${rankFor(score).en}\n`)

// Shifts never repeat a traveller name.
for (let i = 0; i < 200; i++) {
  const names = generateShift({ rng }).map((t) => t.name)
  if (new Set(names).size !== names.length) failures.push(`shift ${i} repeats a name: ${names.join(', ')}`)
}

// Ranks: 5 thresholds spread evenly from 0 to the best possible shift score.
const max = maxPossibleScore()
const expected = rules.config.ranks.map((_, i) => Math.round((max * i) / rules.config.ranks.length))
const actual = rules.config.ranks.map((r) => r.minScore)
console.log(`Max possible score: ${max} (${rules.config.travellersPerGame} travellers). Rank thresholds: ${actual.join(' / ')}
`)
if (actual.join() !== expected.join()) failures.push(`rank thresholds ${actual.join('/')} should be ${expected.join('/')} for max ${max}`)

if (failures.length) {
  console.error(`✗ ${failures.length} failure(s):`)
  for (const f of failures.slice(0, 30)) console.error('  ' + f)
  process.exit(1)
}
console.log(`✓ All ${COUNT} travellers evaluated as expected`)
