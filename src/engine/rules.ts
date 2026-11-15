// Loads game-rules.json (the single source of truth), validates its internal
// references once at import time, and exposes typed lookups.
import data from '../data/game-rules.json' with { type: 'json' }
import { assertConditionParses } from './conditions.ts'
import type {
  Country,
  DenyReason,
  DocumentId,
  Flaw,
  Purpose,
  PurposeId,
  Question,
  Rank,
  RouteType,
  TransitCountry,
} from './types.ts'

export type RulesJson = typeof data

export const rules = data
export const config = data.config
export const scoringConfig = data.config.scoring
export const logic = data.requirementLogic

export const countries = data.countries as Country[]
// JSON infers answer variants as optional-undefined unions, so widen via unknown.
export const questions = data.questions as unknown as Question[]
export const flaws = data.flaws as Flaw[]
export const denyReasons = data.denyReasons as DenyReason[]
export const ranks = [...(data.config.ranks as Rank[])].sort((a, b) => a.minScore - b.minScore)
export const documentIds = Object.keys(data.documents) as DocumentId[]

export const purposes = Object.fromEntries(
  Object.entries(data.purposes).map(([id, p]) => [id, { id, ...p }]),
) as Record<PurposeId, Purpose>

/** Transit country lists keyed by route type ("direct" has none). */
export function transitCountriesFor(type: RouteType): TransitCountry[] {
  const list = (data as Record<string, unknown>)[`${type}Countries`]
  return Array.isArray(list) ? (list as TransitCountry[]) : []
}

const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((x) => [x.id, x]))
const questionMap = byId(questions)
const flawMap = byId(flaws)
const denyReasonMap = byId(denyReasons)

export function getQuestion(id: string): Question {
  const q = questionMap.get(id)
  if (!q) throw new Error(`Unknown question "${id}"`)
  return q
}

export function getFlaw(id: string): Flaw {
  const f = flawMap.get(id)
  if (!f) throw new Error(`Unknown flaw "${id}"`)
  return f
}

export function getDenyReason(id: string): DenyReason {
  const r = denyReasonMap.get(id)
  if (!r) throw new Error(`Unknown deny reason "${id}"`)
  return r
}

/** Months of passport validity required, parsed from requirementLogic.passportRule. */
export const passportValidityMonths = (() => {
  const m = /gameDate\s*\+\s*(\d+)\s*months?/.exec(logic.passportRule)
  if (!m) throw new Error(`Cannot parse passportRule "${logic.passportRule}"`)
  return Number(m[1])
})()

// ---------------------------------------------------------------------------
// Validation — fail loudly at load if the JSON references something missing.
// ---------------------------------------------------------------------------

function validate() {
  const errors: string[] = []
  const docs = new Set<string>(documentIds)
  const check = (ok: boolean, msg: string) => ok || errors.push(msg)

  for (const [id, p] of Object.entries(purposes)) {
    check(docs.has(p.visaDocIfRequired), `purposes.${id}.visaDocIfRequired "${p.visaDocIfRequired}" is not a document`)
    check(p.stayDaysRange.length === 2 && p.stayDaysRange[0] <= p.stayDaysRange[1], `purposes.${id}.stayDaysRange is invalid`)
  }
  for (const d of logic.alwaysRequired) check(docs.has(d), `alwaysRequired "${d}" is not a document`)
  const nq = logic.necessaryQuestions
  for (const q of [...nq.always, ...nq.ifVisaRequired, ...nq.ifYellowFeverRequired]) {
    check(questionMap.has(q), `necessaryQuestions references unknown question "${q}"`)
  }
  for (const f of flaws) {
    const w: unknown = (f as { weight?: unknown }).weight
    check(typeof w === 'number' && Number.isFinite(w) && w > 0, `flaw ${f.id} needs a positive numeric weight (got ${JSON.stringify(w)})`)
    check(denyReasonMap.has(f.denyReason), `flaw ${f.id} has unknown denyReason "${f.denyReason}"`)
    for (const q of [f.revealedBy, f.requiresQuestionToSee]) {
      if (q) check(questionMap.has(q), `flaw ${f.id} references unknown question "${q}"`)
    }
  }
  for (const route of Object.keys(data.routeChance) as RouteType[]) {
    check(route === 'direct' || transitCountriesFor(route).length > 0, `routeChance.${route} has no "${route}Countries" list`)
  }
  for (const c of countries) check(c.names.length > 0, `country ${c.code} has no names`)
  for (const cond of [...logic.visaRequiredWhen, ...logic.yellowFeverRequiredWhen, ...flaws.map((f) => f.applicableWhen)]) {
    try {
      assertConditionParses(cond)
    } catch (e) {
      errors.push((e as Error).message)
    }
  }
  if (errors.length) throw new Error(`game-rules.json is invalid:\n  - ${errors.join('\n  - ')}`)
}

validate()
