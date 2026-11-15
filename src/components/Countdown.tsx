import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { config } from '../engine/rules'
import { useSecondsLeft } from '../hooks/useSecondsLeft'
import { useGameStore } from '../store/gameStore'
import { useSoundStore } from '../store/soundStore'
import { playTick } from '../utils/sound'

/** Seconds at which the tick gets higher and the number turns red. */
const URGENT_SEC = 3

/**
 * Final-seconds countdown: a tick every second (higher for the last 3) and a
 * big faint number in the scene behind the traveller.
 */
export default function Countdown() {
  const running = useGameStore((s) => s.deadline !== null)
  const muted = useSoundStore((s) => s.muted)
  const secondsLeft = useSecondsLeft()
  const display = Math.ceil(secondsLeft)
  const active = running && display >= 1 && display <= config.timerWarningSec
  const lastTicked = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      lastTicked.current = null
      return
    }
    if (lastTicked.current === display) return
    lastTicked.current = display
    if (!muted) playTick(display <= URGENT_SEC)
  }, [active, display, muted])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <AnimatePresence>
        {active && (
          <motion.span
            key={display}
            initial={{ opacity: 0, scale: 1.25 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`absolute text-[min(40vh,18rem)] leading-none font-extrabold tabular-nums ${
              display <= URGENT_SEC ? 'text-deny/15' : 'text-ink/[0.07]'
            }`}
          >
            {display}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
