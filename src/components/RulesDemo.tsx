import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { generateTraveller } from '../engine/generateTraveller'
import { questions, rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { createRng } from '../utils/random'
import Avatar from './Avatar'
import { DocumentThumb } from './DocumentCard'
import Flag from './Flag'
import { StampMark } from './Stamp'

// Timeline (ms from loop start) for the looping example.
const STEPS = [
  { at: 0, step: 0 }, // traveller at the counter
  { at: 700, step: 1 }, // passport slides onto the desk
  { at: 1800, step: 2 }, // officer taps a question
  { at: 2300, step: 3 }, // traveller is typing…
  { at: 3600, step: 4 }, // answer appears
  { at: 5000, step: 5 }, // stamp!
]
const LOOP_MS = 7500

/** Short looping example: passport slides in, a question is asked, stamp. */
export default function RulesDemo() {
  const { t } = useText()
  const [step, setStep] = useState(0)
  const [loop, setLoop] = useState(0)

  // A real, flawless traveller so the demo shows genuine documents and answers.
  const traveller = useMemo(() => generateTraveller({ rng: createRng(60), forceFlawId: null, id: 'demo' }), [])
  const question = questions[0]
  const passport = { slot: 'passport' as const, docId: 'passport' as const }

  useEffect(() => {
    const timers = STEPS.map(({ at, step }) => setTimeout(() => setStep(step), at))
    timers.push(setTimeout(() => setLoop((l) => l + 1), LOOP_MS))
    return () => timers.forEach(clearTimeout)
  }, [loop])

  return (
    <div className="relative h-80 overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#e8edf7,#f7f8fa)] shadow-soft">
      {/* Traveller */}
      <div className="absolute top-3 left-4 flex flex-col items-center">
        <div className="mb-1 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-soft">
          <Flag code={traveller.country.code} className="h-3.5" />
          {t(traveller.country)}
        </div>
        <Avatar seed={traveller.avatarSeed} purpose={traveller.purpose} className="h-36 w-auto" />
      </div>

      {/* Question chip */}
      <motion.div
        className={`absolute top-6 right-4 max-w-[55%] rounded-full px-3 py-2 text-sm font-semibold ${
          step >= 4 ? 'bg-brand-50 text-brand' : step >= 2 ? 'bg-brand text-white' : 'bg-white text-ink shadow-soft'
        }`}
        animate={step === 2 ? { scale: [1, 0.92, 1] } : { scale: 1 }}
      >
        {step >= 2 && step < 4 && '👆 '}
        {step >= 4 && '✓ '}
        {t(question)}
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div
            className="absolute top-20 right-4 max-w-[55%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm font-semibold text-ink shadow-lift"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {step === 3 ? (
              <span className="flex gap-1 py-1">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="size-2 rounded-full bg-muted" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </span>
            ) : (
              t(traveller.answers[question.id].text)
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desk */}
      <div className="absolute inset-x-0 bottom-0 h-28 rounded-t-2xl bg-white shadow-[0_-6px_20px_rgb(17_24_39/0.06)]">
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              key={`passport-${loop}`}
              className="absolute bottom-3 left-1/2 h-22 w-40"
              initial={{ x: '-50%', y: -120, opacity: 0, rotate: -12 }}
              animate={{ x: '-50%', y: 0, opacity: 1, rotate: -2 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 16, stiffness: 200 }}
            >
              <DocumentThumb traveller={traveller} doc={passport} />
              {step >= 5 && (
                <motion.div
                  className="absolute top-1/2 left-1/2"
                  initial={{ x: '-50%', y: '-50%', scale: 3, rotate: -25, opacity: 0 }}
                  animate={{ x: '-50%', y: '-50%', scale: 1, rotate: -12, opacity: 1 }}
                  transition={{ duration: 0.2, ease: [0.6, 0, 1, 1] }}
                >
                  <StampMark decision="APPROVE" size="sm" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted">
        ▶ {t(rules.ui.rules.exampleTitle)}
      </div>
    </div>
  )
}
