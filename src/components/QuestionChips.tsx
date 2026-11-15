import { motion } from 'framer-motion'
import { questionsFor } from '../engine/requirements'
import { rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { selectTraveller, useGameStore } from '../store/gameStore'

/** Question chips under the traveller. All chips lock while the traveller answers. */
export default function QuestionChips() {
  const { t } = useText()
  const phase = useGameStore((s) => s.phase)
  const asked = useGameStore((s) => s.askedQuestionIds)
  const answeringId = useGameStore((s) => s.answeringId)
  const askQuestion = useGameStore((s) => s.askQuestion)
  const traveller = useGameStore(selectTraveller)
  // Some questions only apply to some travellers (e.g. proof of study for students).
  const questions = traveller ? questionsFor(traveller) : []
  const locked = phase !== 'inspecting' || answeringId !== null
  // Next step hint: at the start of each traveller, the chips are the thing to tap.
  const hint = phase === 'inspecting' && asked.length === 0 && answeringId === null

  return (
    <div className="relative z-10 px-4 pb-4 sm:px-6">
      <div className="mb-2 text-sm font-semibold text-muted">{t(rules.ui.game.askQuestion)}</div>
      <div className="flex flex-wrap gap-2.5">
        {questions.map((q) => {
          const isAsked = asked.includes(q.id)
          const isAnswering = answeringId === q.id
          return (
            <motion.button
              key={q.id}
              onClick={() => askQuestion(q.id)}
              disabled={locked}
              whileTap={locked ? undefined : { scale: 0.96 }}
              aria-pressed={isAsked}
              className={`min-h-12 rounded-full px-4 py-2 text-left text-base leading-tight font-semibold transition-colors ${
                isAnswering
                  ? 'bg-brand text-white shadow-soft'
                  : isAsked
                    ? 'bg-brand-50 text-brand'
                    : 'bg-white text-ink shadow-soft hover:bg-brand-50'
              } disabled:cursor-not-allowed ${locked && !isAnswering ? 'opacity-50' : ''} ${hint ? 'animate-hint' : ''}`}
            >
              {isAsked && '✓ '}
              {t(q)}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
