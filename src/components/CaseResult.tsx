import { motion } from 'framer-motion'
import { getQuestion, rules } from '../engine/rules'
import type { RoundResult, Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import { selectIsLastRound, useGameStore } from '../store/gameStore'
import Headline from './Headline'

const cr = rules.caseResult
/** Accent strip per outcome: brand for correct; red for mistakes and timeouts (both are strikes). */
const VERDICT_STRIP = { correct: 'bg-brand', wrong: 'bg-deny', timeout: 'bg-deny' } as const

/** Builds the case summary sentence from caseResult.template. */
function useSummary(traveller: Traveller, result: RoundResult) {
  const { t } = useText()
  const verdict = cr.verdicts[result.outcome]
  const missed = result.missedQuestionIds.map((id) => t(getQuestion(id))).join(', ')
  return t(cr.template, {
    verdictIcon: verdict.icon,
    verdictText: t(verdict),
    flawExplain: t(traveller.flaw?.explain ?? cr.noFlawExplain),
    askedNecessary: result.askedNecessaryIds.length,
    totalNecessary: result.necessaryQuestionIds.length,
    missedList: missed ? t(cr.missedPrefix) + missed : '',
  })
}

/** Result card after each traveller, with the headline on mistakes and the Next button. */
export default function CaseResult({ traveller, result }: { traveller: Traveller; result: RoundResult }) {
  const { t } = useText()
  const headline = useGameStore((s) => s.headline)
  const isLastRound = useGameStore(selectIsLastRound)
  const nextTraveller = useGameStore((s) => s.nextTraveller)
  const summary = useSummary(traveller, result)
  const points = result.breakdown.total

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30 }}
      className="flex w-[min(34rem,92vw)] flex-col gap-3"
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-lift">
        <div className={`h-1.5 ${VERDICT_STRIP[result.outcome]}`} />
        <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-5xl leading-none" aria-hidden>
            {cr.verdicts[result.outcome].icon}
          </span>
          <span className="rounded-full bg-brand-50 px-4 py-1.5 text-2xl font-extrabold text-brand tabular-nums">
            {t(rules.ui.game.points, { points })}
            {result.breakdown.streakMultiplier > 1 && <span className="ml-1 text-base">🔥×{result.breakdown.streakMultiplier}</span>}
          </span>
        </div>
        {/* The JSON template already starts with the verdict, so it is rendered once, as-is. */}
        <p className="text-lg leading-relaxed font-medium text-ink sm:text-xl">{summary}</p>
        <button
          onClick={nextTraveller}
          autoFocus
          className="mt-5 h-16 w-full animate-hint rounded-2xl bg-brand text-xl font-bold text-white hover:bg-brand-600"
        >
          {t(isLastRound ? rules.ui.game.finish : rules.ui.game.next)} →
        </button>
        </div>
      </div>
      {headline && <Headline headline={headline} />}
    </motion.div>
  )
}
