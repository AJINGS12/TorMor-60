import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState, type MouseEvent } from 'react'
import Avatar from '../components/Avatar'
import LanguageToggle from '../components/LanguageToggle'
import Leaderboard from '../components/Leaderboard'
import NightAirport from '../components/NightAirport'
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
        <Avatar seed={lap * 7919 + 17} purpose={PURPOSES[lap % PURPOSES.length]} className="h-full w-auto opacity-90" />
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
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-night-900 p-5 ring-2 ring-neon-red glow-red">
        <p className="mb-4 text-lg font-semibold">{t(rules.ui.leaderboard.resetConfirm)}</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="h-12 rounded-xl font-semibold ring-1 ring-white/25 hover:bg-white/10">
            {t(rules.ui.game.cancel)}
          </button>
          <button
            onClick={() => {
              clear()
              onClose()
            }}
            className="h-12 rounded-xl bg-neon-red font-extrabold text-white"
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
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-night-950">
      <NightAirport />
      <Passerby />

      <header className="relative z-10 flex justify-end p-4">
        <LanguageToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-6 text-center">
        <div {...longPress} className="cursor-default touch-none select-none">
          <motion.span
            className="mb-2 inline-block rounded-md border-2 border-neon-amber px-3 py-0.5 text-lg font-extrabold text-neon-amber shadow-[0_0_14px_rgb(255_197_61/0.6)]"
            initial={{ rotate: -8, scale: 0 }}
            animate={{ rotate: -8, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            {t(ui.logoBadge)}
          </motion.span>
          <motion.h1
            className="text-6xl leading-none font-extrabold tracking-tight text-white sm:text-8xl"
            style={{ textShadow: '0 0 18px #22e4ff, 0 0 42px #22e4ff, 0 0 80px #ff3fa4' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0.6, 1, 0.85, 1], scale: 1 }}
            transition={{ duration: 1.4, times: [0, 0.3, 0.4, 0.55, 0.65, 1] }}
          >
            {t(ui.logo)}
          </motion.h1>
        </div>

        <motion.p
          className="max-w-xl text-xl font-semibold text-cyan-100 sm:text-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {t(ui.subtitle)}
        </motion.p>

        <motion.button
          onClick={nextScreen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, scale: [1, 1.04, 1] }}
          transition={{ opacity: { delay: 1 }, y: { delay: 1 }, scale: { duration: 1.6, repeat: Infinity, delay: 1.5 } }}
          whileTap={{ scale: 0.95 }}
          className="min-h-16 rounded-2xl bg-neon-pink px-8 py-4 text-xl font-extrabold text-white glow-pink sm:text-2xl"
        >
          {t(ui.cta)} →
        </motion.button>

        <motion.section
          className="w-full max-w-md rounded-2xl bg-night-900/80 p-4 ring-1 ring-neon-cyan/40 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="mb-1 text-left text-sm font-semibold tracking-wider text-neon-cyan uppercase">🏆 {t(ui.topOfficers)}</h2>
          <Leaderboard limit={3} compact />
        </motion.section>
      </main>

      <footer className="relative z-10 flex justify-end px-5 pb-4">
        <span className="rounded-full bg-night-900/80 px-4 py-1.5 text-sm font-semibold text-slate-300 ring-1 ring-white/15">{t(ui.byNitify)}</span>
      </footer>

      <AnimatePresence>{confirmReset && <ResetDialog onClose={() => setConfirmReset(false)} />}</AnimatePresence>
    </div>
  )
}
