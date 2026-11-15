// Engine types. ID unions for keyed maps are derived from game-rules.json so
// they stay in sync with the data; list-based IDs are plain strings and are
// validated at load time in rules.ts.
import type { RulesJson } from './rules.ts'
import type { ISODate } from '../utils/dates.ts'


export type Lang = 'en' | 'th'
export interface LocalizedText {
  en: string
  th: string
}

export type DocumentId = keyof RulesJson['documents']
export type PurposeId = keyof RulesJson['purposes']
export type RouteType = keyof RulesJson['routeChance']
export type CountryCode = string
export type QuestionId = string
export type FlawId = string
export type DenyReasonId = string

// ---------------------------------------------------------------------------
// Rules data
// ---------------------------------------------------------------------------

export interface Country extends LocalizedText {
  code: CountryCode
  flag: string
  visaExemptTourismDays: number
  exemptionBasis: string
  yellowFeverByNationality: boolean
  names: string[]
  trivia?: LocalizedText
}

export interface TransitCountry extends LocalizedText {
  code: CountryCode
  flag: string
}

export interface Purpose extends LocalizedText {
  id: PurposeId
  weight: number
  stayDaysRange: [number, number]
  visaDocIfRequired: DocumentId
}

export interface Question extends LocalizedText {
  id: QuestionId
  /** Which traveller fact or document this question uncovers. */
  reveals: string
  /** Short labels for the question list (the full text is used in the chat). */
  shortEn: string
  shortTh: string
  icon: string
  /** Optional condition: the question is only offered when it holds (e.g. "purpose == 'study'"). */
  showWhen?: string
  /** Answer variants keyed by answer key (e.g. "default", "no_tdac"). */
  answers: Record<string, LocalizedText>
}

export interface Flaw {
  id: FlawId
  denyReason: DenyReasonId
  /** Relative pick weight among the flaws applicable to a traveller (> 0). */
  weight: number
  /** Condition expression, e.g. "purpose == 'tourism'" or "always". */
  applicableWhen: string
  /** Detectable by looking at documents alone. */
  visualOnly?: boolean
  /** Document only appears on the desk after this question is asked. */
  requiresQuestionToSee?: QuestionId
  /** Only exposed through the answer to this question. */
  revealedBy?: QuestionId
  effect?: string
  explain: LocalizedText
}

export interface DenyReason extends LocalizedText {
  id: DenyReasonId
}

// ---------------------------------------------------------------------------
// Traveller
// ---------------------------------------------------------------------------

export interface Route {
  type: RouteType
  /** Departure country (the traveller's nationality). */
  from: CountryCode
  transit: TransitCountry | null
}

export interface Passport {
  name: string
  number: string
  nationality: CountryCode
  dateOfBirth: ISODate
  expiry: ISODate
}

export interface Tdac {
  name: string
  nationality: CountryCode
  arrivalDate: ISODate
  stayDays: number
  purpose: PurposeId
  flightFrom: CountryCode
  transit: CountryCode | null
}

export interface ReturnTicket {
  name: string
  departureDate: ISODate
  destination: CountryCode
}

export interface Visa {
  type: DocumentId
  name: string
  validUntil: ISODate
}

export interface SchoolLetter {
  name: string
  university: string
  startDate: ISODate
}

export interface YellowFeverCert {
  name: string
  vaccinationDate: ISODate
}

/** Documents the traveller actually carries. `null` = not carried. */
export interface TravellerDocuments {
  passport: Passport
  tdac: Tdac | null
  return_ticket: ReturnTicket | null
  visa: Visa | null
  yellow_fever_cert: YellowFeverCert | null
  school_letter: SchoolLetter | null
}

export interface TravellerAnswer {
  /** Answer variant key from the question's `answers` map. */
  key: string
  text: LocalizedText
}

export interface Traveller {
  id: string
  name: string
  country: Country
  purpose: PurposeId
  stayDays: number
  route: Route
  documents: TravellerDocuments
  /** The single applied flaw, or null if the traveller is valid. */
  flaw: Flaw | null
  /** Answer key: what the traveller says for each question. */
  answers: Record<QuestionId, TravellerAnswer>
  /** Deny reasons offered in the picker (always includes the correct one). */
  denyReasonChoices: DenyReasonId[]
  /** The date the game is played, used for passport validity. */
  gameDate: ISODate
  /** Stable random number for picking an avatar. */
  avatarSeed: number
}

// ---------------------------------------------------------------------------
// Requirements & evaluation
// ---------------------------------------------------------------------------

export interface Requirements {
  requiredDocuments: DocumentId[]
  visaRequired: boolean
  /** Required visa document, or null if no visa is required. */
  visaDocument: DocumentId | null
  /** True when a visa is required only because the tourism stay is too long. */
  visaRequiredOnlyForStay: boolean
  yellowFeverRequired: boolean
  necessaryQuestionIds: QuestionId[]
  /** Passport must expire on or after this date. */
  minPassportExpiry: ISODate
}

export interface Violation {
  flawId: FlawId
  denyReasonId: DenyReasonId
}

export type Decision = 'APPROVE' | 'DENY'
/** `TIMEOUT` is passed when the timer ran out before a stamp. */
export type DecisionInput = Decision | 'TIMEOUT'
export type Outcome = 'correct' | 'wrong' | 'timeout'

export interface ScoreBreakdown {
  correctDecision: number
  correctDenyReason: number
  necessaryQuestions: number
  unnecessaryQuestions: number
  missedQuestions: number
  speedBonus: number
  /** Flat score for a wrong decision or timeout (config.scoring). */
  penalty: number
  subtotal: number
  streakMultiplier: number
  total: number
}

export interface RoundResult {
  travellerId: string
  decision: DecisionInput
  expectedDecision: Decision
  outcome: Outcome
  correct: boolean
  denyReasonId: DenyReasonId | null
  correctDenyReasonIds: DenyReasonId[]
  denyReasonCorrect: boolean
  violations: Violation[]
  necessaryQuestionIds: QuestionId[]
  askedNecessaryIds: QuestionId[]
  missedQuestionIds: QuestionId[]
  unnecessaryQuestionIds: QuestionId[]
  secondsLeft: number
  breakdown: ScoreBreakdown
  streakBefore: number
  streakAfter: number
  strike: boolean
}

export interface Rank extends LocalizedText {
  minScore: number
}
