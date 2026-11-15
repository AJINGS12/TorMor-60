import { motion } from 'framer-motion'
import { questions, rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

/** Question chips under the traveller. All chips lock while the traveller answers. */
export default function QuestionChips() {
  const { t } = useText()
  const phase = useGameStore((s) => s.phase)
  const asked = useGameStore((s) => s.askedQuestionIds)
  const answeringId = useGameStore((s) => s.answeringId)
  const askQuestion = useGameStore((s) => s.askQuestion)
  const locked = phase !== 'inspecting' || answeringId !== null

  return (
    <div className="relative z-10 px-3 pb-3 sm:px-5">
      <div className="mb-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">{t(rules.ui.game.askQuestion)}</div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => {
          const isAsked = asked.includes(q.id)
          const isAnswering = answeringId === q.id
          return (
            <motion.button
              key={q.id}
              onClick={() => askQuestion(q.id)}
              disabled={locked}
              whileTap={locked ? undefined : { scale: 0.95 }}
              aria-pressed={isAsked}
              className={`min-h-12 rounded-full px-4 py-2 text-left text-sm leading-tight font-semibold transition sm:text-base ${
                isAnswering
                  ? 'bg-neon-amber text-night-950 glow-pink'
                  : isAsked
                    ? 'bg-neon-cyan/15 text-neon-cyan ring-1 ring-neon-cyan/60'
                    : 'bg-night-800/90 text-white ring-1 ring-white/20 hover:ring-neon-cyan/70'
              } disabled:cursor-not-allowed ${locked && !isAnswering ? 'opacity-45' : ''}`}
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
