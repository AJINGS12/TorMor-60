import { AnimatePresence, motion } from 'framer-motion'
import { getQuestion, rules } from '../engine/rules'
import type { Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

function TypingDots() {
  return (
    <span className="flex gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-3 rounded-full bg-slate-500"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

/** The traveller's reply: typing dots while answering, then the answer text. */
export default function SpeechBubble({ traveller }: { traveller: Traveller }) {
  const { t } = useText()
  const phase = useGameStore((s) => s.phase)
  const answeringId = useGameStore((s) => s.answeringId)
  const lastAnsweredId = useGameStore((s) => s.lastAnsweredId)

  const questionId = answeringId ?? lastAnsweredId
  const visible = phase !== 'entering' && questionId !== null
  const answer = lastAnsweredId ? traveller.answers[lastAnsweredId] : null

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={`${traveller.id}-${questionId}`}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-[min(22rem,42vw)] origin-bottom-left rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-slate-900 shadow-[0_0_30px_rgb(34_228_255/0.35)]"
          aria-live="polite"
        >
          <div className="mb-1 text-xs font-semibold text-cyan-700">🧑‍✈️ {questionId && t(getQuestion(questionId))}</div>
          {answeringId ? (
            <span aria-label={t(rules.ui.game.answering)}>
              <TypingDots />
            </span>
          ) : (
            answer && <p className="text-lg leading-snug font-semibold sm:text-xl">{t(answer.text)}</p>
          )}
          {/* Tail pointing at the traveller */}
          <span className="absolute -bottom-2 left-0 size-4 [clip-path:polygon(0_0,100%_0,0_100%)] bg-white" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
