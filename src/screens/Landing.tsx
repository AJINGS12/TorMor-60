import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState, type MouseEvent } from 'react'
import Avatar from '../components/Avatar'
import LanguageToggle from '../components/LanguageToggle'
import Leaderboard from '../components/Leaderboard'
import AirportScene from '../components/AirportScene'
import { rules } from '../engine/rules'
import type { PurposeId } from '../engine/types'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'
import { useLeaderboard } from '../store/leaderboard'

const ui = rules.ui.landing
const LONG_PRESS_MS = 3000
const PURPOSES = Object.keys(rules.purposes) as PurposeId[]

/** A traveller strolling across the concourse; a different one each lap. */
function Passerby() {
  const [lap, setLap] = useState(0)
  return (
    <motion.div
      key={lap}
      className="pointer-events-none absolute bottom-[8%] h-[34%] max-h-72 min-h-40"
      initial={{ x: '-25vw' }}
      animate={{ x: '110vw' }}
      transition={{ duration: 11, ease: 'linear' }}
      onAnimationComplete={() => setLap((l) => l + 1)}
    >
      <motion.div
        className="h-full"
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Avatar seed={lap * 7919 + 17} purpose={PURPOSES[lap % PURPOSES.length]} className="h-full w-auto drop-shadow-[0_10px_14px_rgb(17_24_39/0.12)]" />
      </motion.div>
    </motion.div>
  )
}

/** Hidden staff control: hold the logo for 3 s to clear the leaderboard. */
function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const cancel = () => clearTimeout(timer.current)
  return {
    onPointerDown: () => {
      cancel()
      timer.current = setTimeout(onLongPress, LONG_PRESS_MS)
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  }
}

function ResetDialog({ onClose }: { onClose: () => void }) {
  const { t } = useText()
  const clear = useLeaderboard((s) => s.clear)
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift">
        <p className="mb-5 text-lg font-semibold text-ink">{t(rules.ui.leaderboard.resetConfirm)}</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-12 rounded-xl bg-canvas font-semibold text-ink hover:bg-line">
            {t(rules.ui.game.cancel)}
          </button>
          <button
            onClick={() => {
              clear()
              onClose()
            }}
            className="h-12 rounded-xl bg-deny font-bold text-white"
          >
            {t(rules.ui.leaderboard.resetYes)}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  const { t } = useText()
  const nextScreen = useGameStore((s) => s.nextScreen)
  const [confirmReset, setConfirmReset] = useState(false)
  const longPress = useLongPress(() => setConfirmReset(true))

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas">
      <AirportScene />
      <Passerby />

      <header className="relative z-10 flex justify-end p-5">
        <LanguageToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-7 px-4 pb-6 text-center">
        <div {...longPress} className="cursor-default touch-none select-none">
          <motion.span
            className="mb-3 inline-block rounded-full bg-brand-50 px-4 py-1 text-lg font-bold text-brand"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {t(ui.logoBadge)}
          </motion.span>
          <motion.h1
            className="text-6xl leading-none font-extrabold tracking-tight text-ink sm:text-8xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {t(ui.logo)
              .split(/(d+)/)
              .map((part, i) => (/d/.test(part) ? <span key={i} className="text-brand">{part}</span> : part))}
          </motion.h1>
        </div>

        <motion.p
          className="max-w-xl text-xl font-medium text-muted sm:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t(ui.subtitle)}
        </motion.p>

        <motion.button
          onClick={nextScreen}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          whileTap={{ scale: 0.97 }}
          className="min-h-16 animate-hint rounded-2xl bg-brand px-10 py-4 text-xl font-bold text-white shadow-soft hover:bg-brand-600 sm:text-2xl"
        >
          {t(ui.cta)} →
        </motion.button>

        <motion.section
          className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <h2 className="mb-1 text-left text-base font-semibold text-muted">🏆 {t(ui.topOfficers)}</h2>
          <Leaderboard limit={3} compact />
        </motion.section>
      </main>

      <footer className="relative z-10 flex justify-end px-5 pb-5">
        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-muted shadow-soft">{t(ui.byNitify)}</span>
      </footer>

      <AnimatePresence>{confirmReset && <ResetDialog onClose={() => setConfirmReset(false)} />}</AnimatePresence>
    </div>
  )
}
