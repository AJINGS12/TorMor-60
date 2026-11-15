// Random traveller generation. Pure given its inputs: pass a seeded `rng` and a
// fixed `today` to get reproducible travellers.
import { addDays, toISODate, type ISODate } from '../utils/dates.ts'
import { chance, pick, randInt, shuffle, weightedPick, type Rng } from '../utils/random.ts'
import { getRequirements, isFlawApplicable, type TravellerFacts } from './requirements.ts'
import {
  config,
  countries,
  denyReasons,
  documentIds,
  flaws,
  getFlaw,
  purposes,
  questions,
  rules,
  transitCountriesFor,
} from './rules.ts'
import type {
  DenyReasonId,
  DocumentId,
  Flaw,
  LocalizedText,
  PurposeId,
  Question,
  Requirements,
  Route,
  RouteType,
  Traveller,
  TravellerAnswer,
  TravellerDocuments,
} from './types.ts'

// Generation tuning (not game rules): ranges used to make valid documents look real.
const PASSPORT_EXTRA_VALIDITY_DAYS: [number, number] = [1, 3650]
const AGE_YEARS: [number, number] = [18, 70]
const VISA_EXTRA_VALIDITY_DAYS: [number, number] = [30, 365]
const VACCINATED_DAYS_AGO: [number, number] = [30, 3650]

export interface GenerateOptions {
  rng?: Rng
  /** The game date. Defaults to today (config.gameDate = "runtime_today"). */
  today?: Date | ISODate
  /** Force a specific flaw (must be applicable), or `null` for a valid traveller. */
  forceFlawId?: string | null
  id?: string
}

export function resolveGameDate(today: Date | ISODate = new Date()): ISODate {
  if (config.gameDate !== 'runtime_today') return config.gameDate
  return typeof today === 'string' ? today : toISODate(today)
}

// ---------------------------------------------------------------------------
// Flaw effects
// ---------------------------------------------------------------------------

/** Parses "random(a..b)" out of a flaw's effect text. */
function effectRange(flaw: Flaw): [number, number] {
  const m = /random\((\d+)\.\.(\d+)/.exec(flaw.effect ?? '')
  if (!m) throw new Error(`Flaw ${flaw.id} effect has no random(a..b) range: "${flaw.effect}"`)
  return [Number(m[1]), Number(m[2])]
}

/** Parses "gameDate +/- random(...)" sign from a flaw's effect text. */
function effectSign(flaw: Flaw): 1 | -1 {
  const m = /gameDate\s*([+-])/.exec(flaw.effect ?? '')
  if (!m) throw new Error(`Flaw ${flaw.id} effect has no "gameDate +/-": "${flaw.effect}"`)
  return m[1] === '-' ? -1 : 1
}

function misspell(rng: Rng, name: string): string {
  const parts = name.split(' ')
  const surname = parts[parts.length - 1]
  const vowels = 'aeiou'
  const positions = [...surname].map((c, i) => (vowels.includes(c.toLowerCase()) && i > 0 ? i : -1)).filter((i) => i >= 0)
  if (positions.length === 0) {
    parts[parts.length - 1] = surname + surname[surname.length - 1]
  } else {
    const i = pick(rng, positions)
    const replacement = pick(rng, [...vowels].filter((v) => v !== surname[i].toLowerCase()))
    parts[parts.length - 1] = surname.slice(0, i) + replacement + surname.slice(i + 1)
  }
  return parts.join(' ')
}

/** Produces a name that differs by one name or by spelling. */
function mismatchedName(rng: Rng, t: Draft): string {
  const [first, ...rest] = t.name.split(' ')
  const otherFirstNames = t.country.names.map((n) => n.split(' ')[0]).filter((f) => f !== first)
  if (rest.length > 0 && otherFirstNames.length > 0 && chance(rng, 0.5)) {
    return [pick(rng, otherFirstNames), ...rest].join(' ')
  }
  return misspell(rng, t.name)
}

type Draft = Omit<Traveller, 'answers' | 'denyReasonChoices'>
type FlawApplier = (draft: Draft, flaw: Flaw, rng: Rng) => void

const setPassportExpiry: FlawApplier = (t, flaw, rng) => {
  const [min, max] = effectRange(flaw)
  t.documents.passport.expiry = addDays(t.gameDate, effectSign(flaw) * randInt(rng, min, max))
}

/** How each flaw changes an otherwise valid traveller. Keyed by flaw id. */
const FLAW_APPLIERS: Record<string, FlawApplier> = {
  passport_expired: setPassportExpiry,
  passport_under_6_months: setPassportExpiry,
  name_mismatch: (t, _flaw, rng) => {
    if (t.documents.tdac) t.documents.tdac.name = mismatchedName(rng, t)
  },
  no_tdac: (t) => {
    t.documents.tdac = null
  },
  no_return_ticket: (t) => {
    t.documents.return_ticket = null
  },
  no_visa: (t) => {
    t.documents.visa = null
  },
  wrong_visa: (t, flaw) => {
    const m = /holds (\w+)/.exec(flaw.effect ?? '')
    const type = m?.[1] as DocumentId | undefined
    if (!type || !documentIds.includes(type)) throw new Error(`Flaw ${flaw.id} effect names no document: "${flaw.effect}"`)
    if (t.documents.visa) t.documents.visa.type = type
  },
  stay_exceeds_exemption: (t, flaw, rng) => {
    const [min, max] = effectRange(flaw)
    t.stayDays = Math.max(randInt(rng, min, max), t.country.visaExemptTourismDays + 1)
    t.documents.visa = null
    if (t.documents.tdac) t.documents.tdac.stayDays = t.stayDays
    if (t.documents.return_ticket) t.documents.return_ticket.departureDate = addDays(t.gameDate, t.stayDays)
  },
  no_yellow_fever: (t) => {
    t.documents.yellow_fever_cert = null
  },
}

for (const f of flaws) {
  if (!FLAW_APPLIERS[f.id]) throw new Error(`No generator effect implemented for flaw "${f.id}"`)
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

/** Chooses which answer variant the traveller gives, based on what they carry. */
function answerKey(q: Question, t: Draft, req: Requirements): string {
  const d = t.documents
  switch (q.reveals) {
    case 'tdac':
      return d.tdac ? 'default' : 'no_tdac'
    case 'return_ticket':
      return d.return_ticket ? 'default' : 'no_return_ticket'
    case 'route':
      return t.route.transit ? 'transit' : 'direct'
    case 'visa':
      if (!d.visa) return req.visaRequired ? 'no_visa' : 'exempt'
      return req.visaDocument && d.visa.type !== req.visaDocument ? 'wrong_visa' : 'default'
    case 'yellow_fever_cert':
      if (d.yellow_fever_cert) return 'default'
      return req.yellowFeverRequired ? 'no_yellow_fever' : 'not_needed'
    default:
      return 'default'
  }
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m))
}

function buildAnswers(t: Draft, req: Requirements): Record<string, TravellerAnswer> {
  const purpose = purposes[t.purpose]
  const vars = (lang: keyof LocalizedText) => ({
    purpose: lang === 'en' ? purpose.en.toLowerCase() : purpose.th,
    stayDays: t.stayDays,
    country: t.country[lang],
    transit: t.route.transit?.[lang] ?? '',
  })
  const answers: Record<string, TravellerAnswer> = {}
  for (const q of questions) {
    const preferred = answerKey(q, t, req)
    const key = preferred in q.answers ? preferred : 'default'
    const tpl = q.answers[key]
    if (!tpl) throw new Error(`Question ${q.id} has no "${preferred}" or "default" answer`)
    answers[q.id] = { key, text: { en: fill(tpl.en, vars('en')), th: fill(tpl.th, vars('th')) } }
  }
  return answers
}

/** Correct reason (if any) + random others, shuffled, per rules.denyReasonChoices. */
function buildDenyReasonChoices(rng: Rng, flaw: Flaw | null): DenyReasonId[] {
  const count = Math.min(rules.denyReasonChoices.count, denyReasons.length)
  const correct = flaw ? [flaw.denyReason] : []
  const others = shuffle(rng, denyReasons.map((r) => r.id).filter((id) => !correct.includes(id)))
  return shuffle(rng, [...correct, ...others.slice(0, count - correct.length)])
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function pickRoute(rng: Rng, from: string): Route {
  const type = weightedPick(rng, rules.routeChance) as RouteType
  const options = transitCountriesFor(type).filter((c) => c.code !== from)
  if (options.length === 0) return { type: 'direct', from, transit: null }
  return { type, from, transit: pick(rng, options) }
}

function passportNumber(rng: Rng): string {
  const letter = String.fromCharCode(65 + randInt(rng, 0, 25))
  return letter + String(randInt(rng, 0, 99_999_999)).padStart(8, '0')
}

function buildValidDocuments(rng: Rng, t: TravellerFacts & { name: string }, req: Requirements): TravellerDocuments {
  const { name, gameDate } = t
  return {
    passport: {
      name,
      number: passportNumber(rng),
      nationality: t.country.code,
      dateOfBirth: addDays(gameDate, -randInt(rng, AGE_YEARS[0] * 365, AGE_YEARS[1] * 365)),
      expiry: addDays(req.minPassportExpiry, randInt(rng, ...PASSPORT_EXTRA_VALIDITY_DAYS)),
    },
    tdac: {
      name,
      nationality: t.country.code,
      arrivalDate: gameDate,
      stayDays: t.stayDays,
      purpose: t.purpose,
      flightFrom: t.route.from,
      transit: t.route.transit?.code ?? null,
    },
    return_ticket: { name, departureDate: addDays(gameDate, t.stayDays), destination: t.country.code },
    visa: req.visaDocument
      ? { type: req.visaDocument, name, validUntil: addDays(gameDate, t.stayDays + randInt(rng, ...VISA_EXTRA_VALIDITY_DAYS)) }
      : null,
    yellow_fever_cert: req.yellowFeverRequired
      ? { name, vaccinationDate: addDays(gameDate, -randInt(rng, ...VACCINATED_DAYS_AGO)) }
      : null,
  }
}

function chooseFlaw(rng: Rng, facts: TravellerFacts, req: Requirements, forceFlawId?: string | null): Flaw | null {
  if (forceFlawId === null) return null
  if (forceFlawId !== undefined) {
    const flaw = getFlaw(forceFlawId)
    if (!isFlawApplicable(flaw, facts, req)) throw new Error(`Flaw ${forceFlawId} is not applicable to this traveller`)
    return flaw
  }
  if (config.maxFlawsPerTraveller < 1 || !chance(rng, config.flawChance)) return null
  // Weights only compete among flaws whose applicableWhen fits this traveller.
  const candidates = flaws.filter((f) => isFlawApplicable(f, facts, req))
  if (candidates.length === 0) return null
  const id = weightedPick(rng, Object.fromEntries(candidates.map((f) => [f.id, f.weight])))
  return getFlaw(id)
}


export function generateTraveller(options: GenerateOptions = {}): Traveller {
  const rng = options.rng ?? Math.random
  const gameDate = resolveGameDate(options.today)

  const country = pick(rng, countries)
  const purpose = weightedPick(
    rng,
    Object.fromEntries(Object.values(purposes).map((p) => [p.id, p.weight])) as Record<PurposeId, number>,
  )
  const stayDays = randInt(rng, ...purposes[purpose].stayDaysRange)
  const route = pickRoute(rng, country.code)
  const name = pick(rng, country.names)

  const facts: TravellerFacts = { country, purpose, stayDays, route, gameDate }
  const validReq = getRequirements(facts)

  const draft: Draft = {
    id: options.id ?? `traveller-${randInt(rng, 0, 2 ** 31).toString(36)}`,
    name,
    ...facts,
    documents: buildValidDocuments(rng, { ...facts, name }, validReq),
    flaw: null,
    avatarSeed: randInt(rng, 0, 1_000_000),
  }

  // Applicability is judged on the valid traveller, before the flaw changes anything.
  const flaw = chooseFlaw(rng, facts, validReq, options.forceFlawId)
  if (flaw) {
    FLAW_APPLIERS[flaw.id](draft, flaw, rng)
    draft.flaw = flaw
  }

  const finalReq = getRequirements(draft)
  return {
    ...draft,
    answers: buildAnswers(draft, finalReq),
    denyReasonChoices: buildDenyReasonChoices(rng, flaw),
  }
}

/** Generates a full shift of travellers (config.travellersPerGame), with no repeated names. */
export function generateShift(options: Omit<GenerateOptions, 'id' | 'forceFlawId'> = {}): Traveller[] {
  const shift: Traveller[] = []
  for (let i = 0; i < config.travellersPerGame; i++) {
    let t = generateTraveller({ ...options, id: `traveller-${i + 1}` })
    // Re-roll a few times if the name is already in this shift (falls back to a repeat if it must).
    for (let tries = 0; tries < 20 && shift.some((x) => x.name === t.name); tries++) {
      t = generateTraveller({ ...options, id: `traveller-${i + 1}` })
    }
    shift.push(t)
  }
  return shift
}

