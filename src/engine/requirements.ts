// Requirement checks and round evaluation. Pure functions, driven by
// requirementLogic in game-rules.json.
import { addMonths } from '../utils/dates.ts'
import { evaluateCondition, type ConditionContext } from './conditions.ts'
import { getFlaw, logic, passportValidityMonths, purposes, rules } from './rules.ts'
import { scoreRound, isStrike } from './scoring.ts'
import type {
  DecisionInput,
  DenyReasonId,
  DocumentId,
  Flaw,
  QuestionId,
  Requirements,
  RoundResult,
  Traveller,
  Violation,
} from './types.ts'

/** The traveller facts requirements depend on (documents are not needed). */
export type TravellerFacts = Pick<Traveller, 'country' | 'purpose' | 'stayDays' | 'route' | 'gameDate'>

const YELLOW_FEVER_DOC: DocumentId = 'yellow_fever_cert'

/** Flaw IDs that the document check attributes violations to. */
const FLAW = {
  passportExpired: 'passport_expired',
  passportUnder6Months: 'passport_under_6_months',
  nameMismatch: 'name_mismatch',
  noTdac: 'no_tdac',
  noReturnTicket: 'no_return_ticket',
  noVisa: 'no_visa',
  wrongVisa: 'wrong_visa',
  stayExceedsExemption: 'stay_exceeds_exemption',
  noYellowFever: 'no_yellow_fever',
} as const
Object.values(FLAW).forEach(getFlaw) // throws at load if the JSON drops one

/** Variables available to condition strings for this traveller. */
export function factsContext(t: TravellerFacts): ConditionContext {
  return {
    ...rules,
    country: t.country,
    purpose: t.purpose,
    stayDays: t.stayDays,
    route: t.route,
  }
}

function visaRequiredFor(ctx: ConditionContext): boolean {
  return logic.visaRequiredWhen.some((cond) => evaluateCondition(cond, ctx))
}

export function getRequirements(t: TravellerFacts): Requirements {
  const ctx = factsContext(t)
  const visaRequired = visaRequiredFor(ctx)
  // Would a visa still be needed for a minimal stay? If not, length of stay is the only trigger.
  const visaRequiredOnlyForStay = visaRequired && !visaRequiredFor({ ...ctx, stayDays: 0 })
  const yellowFeverRequired = logic.yellowFeverRequiredWhen.some((cond) => evaluateCondition(cond, ctx))
  const visaDocument = visaRequired ? purposes[t.purpose].visaDocIfRequired : null

  const requiredDocuments = [...logic.alwaysRequired] as DocumentId[]
  if (visaDocument) requiredDocuments.push(visaDocument)
  if (yellowFeverRequired) requiredDocuments.push(YELLOW_FEVER_DOC)

  const nq = logic.necessaryQuestions
  const necessaryQuestionIds: QuestionId[] = [
    ...nq.always,
    ...(visaRequired ? nq.ifVisaRequired : []),
    ...(yellowFeverRequired ? nq.ifYellowFeverRequired : []),
  ]

  return {
    requiredDocuments,
    visaRequired,
    visaDocument,
    visaRequiredOnlyForStay,
    yellowFeverRequired,
    necessaryQuestionIds,
    minPassportExpiry: addMonths(t.gameDate, passportValidityMonths),
  }
}

/** Whether a flaw's `applicableWhen` condition holds for this traveller. */
export function isFlawApplicable(flaw: Flaw, t: TravellerFacts, req: Requirements = getRequirements(t)): boolean {
  return evaluateCondition(flaw.applicableWhen, {
    ...factsContext(t),
    visaRequired: req.visaRequired,
    yellowFeverRequired: req.yellowFeverRequired,
  })
}

/**
 * Checks the documents the traveller carries against their requirements.
 * Empty list = the traveller should be approved.
 */
export function findViolations(t: Traveller): Violation[] {
  const req = getRequirements(t)
  const d = t.documents
  const found: string[] = []
  const add = (flawId: string) => found.push(flawId)

  if (d.passport.expiry < t.gameDate) add(FLAW.passportExpired)
  else if (d.passport.expiry < req.minPassportExpiry) add(FLAW.passportUnder6Months)

  if (!d.tdac) add(FLAW.noTdac)
  else if (d.tdac.name !== d.passport.name) add(FLAW.nameMismatch)

  if (!d.return_ticket) add(FLAW.noReturnTicket)

  if (req.visaRequired) {
    if (!d.visa) add(req.visaRequiredOnlyForStay ? FLAW.stayExceedsExemption : FLAW.noVisa)
    else if (logic.visaMustMatchPurpose && d.visa.type !== req.visaDocument) add(FLAW.wrongVisa)
  }

  if (req.yellowFeverRequired && !d.yellow_fever_cert) add(FLAW.noYellowFever)

  return found.map((flawId) => ({ flawId, denyReasonId: getFlaw(flawId).denyReason }))
}

/**
 * Scores the officer's decision for one traveller.
 * @param decision       APPROVE / DENY, or TIMEOUT if the timer ran out
 * @param denyReasonId   reason picked when denying (null otherwise)
 * @param askedQuestionIds questions the officer asked
 * @param secondsLeft    seconds remaining on the timer
 * @param streakBefore   consecutive correct decisions before this one
 */
export function evaluate(
  traveller: Traveller,
  decision: DecisionInput,
  denyReasonId: DenyReasonId | null,
  askedQuestionIds: readonly QuestionId[],
  secondsLeft: number,
  streakBefore = 0,
): RoundResult {
  const req = getRequirements(traveller)
  const violations = findViolations(traveller)
  const expectedDecision = violations.length > 0 ? 'DENY' : 'APPROVE'
  const correctDenyReasonIds = [...new Set(violations.map((v) => v.denyReasonId))]

  const outcome = decision === 'TIMEOUT' ? 'timeout' : decision === expectedDecision ? 'correct' : 'wrong'
  const correct = outcome === 'correct'
  const denyReasonCorrect =
    correct && decision === 'DENY' && denyReasonId !== null && correctDenyReasonIds.includes(denyReasonId)

  const asked = new Set(askedQuestionIds)
  const necessary = req.necessaryQuestionIds
  const askedNecessaryIds = necessary.filter((q) => asked.has(q))
  const missedQuestionIds = necessary.filter((q) => !asked.has(q))
  const unnecessaryQuestionIds = [...asked].filter((q) => !necessary.includes(q))

  const { breakdown, streakAfter } = scoreRound({
    outcome,
    denyReasonCorrect,
    askedNecessaryCount: askedNecessaryIds.length,
    unnecessaryCount: unnecessaryQuestionIds.length,
    missedCount: missedQuestionIds.length,
    secondsLeft,
    streakBefore,
  })

  return {
    travellerId: traveller.id,
    decision,
    expectedDecision,
    outcome,
    correct,
    denyReasonId: decision === 'DENY' ? denyReasonId : null,
    correctDenyReasonIds,
    denyReasonCorrect,
    violations,
    necessaryQuestionIds: necessary,
    askedNecessaryIds,
    missedQuestionIds,
    unnecessaryQuestionIds,
    secondsLeft,
    breakdown,
    streakBefore,
    streakAfter,
    strike: isStrike(outcome),
  }
}
