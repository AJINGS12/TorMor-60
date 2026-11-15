import { motion } from 'framer-motion'
import { getQuestion, rules } from '../engine/rules'
import type { RoundResult, Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import { selectIsLastRound, useGameStore } from '../store/gameStore'
import Headline from './Headline'

const cr = rules.caseResult
const VERDICT_STYLE = {
  correct: 'ring-neon-green/80 glow-green',
  wrong: 'ring-neon-red/80 glow-red',
  timeout: 'ring-neon-amber/80',
} as const

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
      <div className={`rounded-2xl bg-night-900/95 p-5 ring-2 backdrop-blur ${VERDICT_STYLE[result.outcome]}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-5xl leading-none" aria-hidden>
            {cr.verdicts[result.outcome].icon}
          </span>
          <span className="rounded-full bg-neon-amber/15 px-3 py-1 text-2xl font-extrabold text-neon-amber tabular-nums">
            {t(rules.ui.game.points, { points })}
            {result.breakdown.streakMultiplier > 1 && <span className="ml-1 text-base text-neon-pink">🔥×{result.breakdown.streakMultiplier}</span>}
          </span>
        </div>
        {/* The JSON template already starts with the verdict, so it is rendered once, as-is. */}
        <p className="text-lg leading-relaxed font-semibold text-slate-100 sm:text-xl">{summary}</p>
        <button
          onClick={nextTraveller}
          autoFocus
          className="mt-4 h-14 w-full rounded-xl bg-neon-cyan text-lg font-extrabold text-night-950 glow-cyan hover:brightness-110"
        >
          {t(isLastRound ? rules.ui.game.finish : rules.ui.game.next)} →
        </button>
      </div>
      {headline && <Headline headline={headline} />}
    </motion.div>
  )
}
