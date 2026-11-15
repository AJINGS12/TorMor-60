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
          className="size-3 rounded-full bg-muted"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
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
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-[min(24rem,42vw)] origin-bottom-left rounded-2xl rounded-bl-md bg-white px-5 py-4 shadow-lift"
          aria-live="polite"
        >
          <div className="mb-1 text-sm font-medium text-muted">{questionId && t(getQuestion(questionId))}</div>
          {answeringId ? (
            <span aria-label={t(rules.ui.game.answering)}>
              <TypingDots />
            </span>
          ) : (
            answer && <p className="text-xl leading-snug font-semibold text-ink sm:text-2xl">{t(answer.text)}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
