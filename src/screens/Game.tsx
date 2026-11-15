import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { useState } from 'react'
import CaseResult from '../components/CaseResult'
import Counter from '../components/Counter'
import DebugOverlay from '../components/DebugOverlay'
import DenyReasonPicker from '../components/DenyReasonPicker'
import Desk from '../components/Desk'
import DocumentCard from '../components/DocumentCard'
import GameScene from '../components/GameScene'
import InterviewPanel from '../components/InterviewPanel'
import LanguageToggle from '../components/LanguageToggle'
import MuteToggle from '../components/MuteToggle'
import Rulebook from '../components/Rulebook'
import { StampSlam } from '../components/Stamp'
import Strikes from '../components/Strikes'
import Timer from '../components/Timer'
import { rules } from '../engine/rules'
import { streakMultiplier } from '../engine/scoring'
import type { Traveller as TravellerData } from '../engine/types'
import { useText } from '../i18n/useText'
import { selectTraveller, useGameStore } from '../store/gameStore'
import { playSfx } from '../store/soundStore'
import { playThunk } from '../utils/sound'

const ui = rules.ui.game

function TopBar({ onOpenRulebook }: { onOpenRulebook: () => void }) {
  const { t } = useText()
  const index = useGameStore((s) => s.index)
  const total = useGameStore((s) => s.travellers.length)
  const score = useGameStore((s) => s.score)
  const streak = useGameStore((s) => s.streak)
  const multiplier = streakMultiplier(streak + 1)

  return (
    <header className="relative z-30 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 bg-white px-4 py-2.5 shadow-soft sm:px-5">
      <span className="hidden text-lg font-extrabold tracking-tight whitespace-nowrap text-ink lg:inline">
        {t(rules.ui.landing.logo)
          .split(/(\d+)/)
          .map((part, i) => (/\d/.test(part) ? <span key={i} className="text-brand">{part}</span> : part))}
      </span>
      <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-base font-semibold whitespace-nowrap text-brand">
        {t(ui.travellerCount, { n: index + 1, total })}
      </span>
      <Timer />
      <Strikes />
      <div className="flex items-baseline gap-2">
        <span className="hidden text-sm font-semibold text-muted md:inline">{t(ui.score)}</span>
        <span className="text-3xl font-extrabold text-ink tabular-nums">{score}</span>
        {multiplier > 1 && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand">🔥 {t(ui.streak, { multiplier })}</span>}
      </div>
      <button
        onClick={onOpenRulebook}
        aria-label={t(ui.rulebook)}
        className="h-12 rounded-full bg-canvas px-4 text-base font-semibold whitespace-nowrap text-ink hover:bg-line"
      >
        📘 <span className="hidden md:inline">{t(ui.rulebook)}</span>
      </button>
      <MuteToggle />
      <LanguageToggle />
    </header>
  )
}

/** Full-screen stamp moment: the passport flies up and the stamp slams onto it. */
function StampOverlay({ traveller, onImpact }: { traveller: TravellerData; onImpact: () => void }) {
  const phase = useGameStore((s) => s.phase)
  const decision = useGameStore((s) => s.lastResult?.decision)
  const stampFinished = useGameStore((s) => s.stampFinished)
  const show = phase === 'stamping' && (decision === 'APPROVE' || decision === 'DENY')

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          <motion.div
            className="relative w-full max-w-xl"
            initial={{ y: 200, rotate: 4, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, rotate: -1, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          >
            <DocumentCard traveller={traveller} doc={{ slot: 'passport', docId: 'passport' }} />
            <StampSlam decision={decision} onImpact={onImpact} onDone={stampFinished} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Layout:
 * - ≥1024px: booth window + desk on the left (~65%), interview panel on the right (~35%).
 * - <1024px: window, desk, then the interview panel (page scrolls); decision buttons pinned to the bottom.
 */
export default function Game() {
  const { t, date } = useText()
  const [rulebookOpen, setRulebookOpen] = useState(false)
  const phase = useGameStore((s) => s.phase)
  const traveller = useGameStore(selectTraveller)
  const lastResult = useGameStore((s) => s.lastResult)
  const [scope, animate] = useAnimate()

  const onStampImpact = () => {
    playSfx(playThunk)
    animate(scope.current, { x: [0, -18, 15, -11, 8, -4, 0], y: [0, 9, -7, 5, -3, 0] }, { duration: 0.45, ease: 'easeOut' })
  }

  if (!traveller) return null

  return (
    // Outer box clips the screen shake so no scrollbars flash during the stamp.
    <div className="h-dvh overflow-hidden bg-canvas">
      <div ref={scope} className="flex h-full flex-col">
        <TopBar onOpenRulebook={() => setRulebookOpen(true)} />

        <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-24 lg:flex-row lg:overflow-hidden lg:pb-0">
          {/* Left: the booth window and the desk */}
          <div className="flex shrink-0 flex-col lg:min-h-0 lg:w-[65%] lg:shrink">
            <div className="flex h-[42dvh] min-h-72 flex-col lg:h-auto lg:min-h-0 lg:flex-1 [&>section]:flex-1">
              <GameScene traveller={traveller} />
            </div>
            <Counter>
              <div className="flex items-end gap-4">
                <Desk key={traveller.id} traveller={traveller} />
                <span className="mb-1 shrink-0 rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-ink shadow-soft">
                  📅 {t(ui.today, { date: date(traveller.gameDate) })}
                </span>
              </div>
            </Counter>
          </div>

          {/* Right: the interview */}
          <div className="flex shrink-0 flex-col lg:min-h-0 lg:w-[35%] lg:shrink">
            <InterviewPanel traveller={traveller} />
          </div>
        </main>

        {/* Case result over the play area once the round is scored */}
        <AnimatePresence>
          {phase === 'result' && lastResult && (
            <motion.div
              key={`result-${traveller.id}`}
              className="fixed inset-0 z-[25] flex flex-col items-center justify-center-safe overflow-y-auto bg-canvas/75 p-4 pt-20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CaseResult traveller={traveller} result={lastResult} />
            </motion.div>
          )}
        </AnimatePresence>

        <Rulebook open={rulebookOpen} onClose={() => setRulebookOpen(false)} />
        <DenyReasonPicker traveller={traveller} />
        <StampOverlay traveller={traveller} onImpact={onStampImpact} />
        <DebugOverlay />
      </div>
    </div>
  )
}
