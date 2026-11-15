import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { useState } from 'react'
import CaseResult from '../components/CaseResult'
import Counter from '../components/Counter'
import Countdown from '../components/Countdown'
import MuteToggle from '../components/MuteToggle'
import DenyReasonPicker from '../components/DenyReasonPicker'
import DocumentCard from '../components/DocumentCard'
import { StampSlam } from '../components/Stamp'
import DebugOverlay from '../components/DebugOverlay'
import Desk from '../components/Desk'
import QuestionChips from '../components/QuestionChips'
import SpeechBubble from '../components/SpeechBubble'
import Traveller from '../components/Traveller'
import LanguageToggle from '../components/LanguageToggle'
import Rulebook from '../components/Rulebook'
import Strikes from '../components/Strikes'
import Timer from '../components/Timer'
import { rules } from '../engine/rules'
import { streakMultiplier } from '../engine/scoring'
import { useText } from '../i18n/useText'
import type { Traveller as TravellerData } from '../engine/types'
import { selectAllNeededAsked, selectTraveller, useGameStore } from '../store/gameStore'
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
    <header className="relative z-20 flex flex-wrap items-center gap-x-5 gap-y-2 bg-white px-4 py-3 shadow-soft sm:px-6">
      <span className="rounded-full bg-brand-50 px-4 py-1.5 text-base font-semibold whitespace-nowrap text-brand">
        {t(ui.travellerCount, { n: index + 1, total })}
      </span>
      <Timer />
      <Strikes />
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-muted">{t(ui.score)}</span>
        <span className="text-3xl font-extrabold text-ink tabular-nums">{score}</span>
        {multiplier > 1 && (
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand">
            🔥 {t(ui.streak, { multiplier })}
          </span>
        )}
      </div>
      <button
        onClick={onOpenRulebook}
        className="h-12 rounded-full bg-canvas px-4 text-base font-semibold text-ink hover:bg-line xl:hidden"
      >
        📘 {t(ui.rulebook)}
      </button>
      <MuteToggle />
      <LanguageToggle />
    </header>
  )
}

/** Bright airport hall behind the traveller. */
function Backdrop() {
  const { t } = useText()
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#eaf1ff_0%,#f7f8fa_70%)]">
      {/* Big window onto the apron */}
      <div className="absolute inset-x-[6%] top-[14%] h-[40%] overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#cfe0ff,#eef4ff)]">
        <div className="absolute bottom-0 h-[22%] w-full bg-white/60" />
        <div className="absolute inset-y-0 left-1/3 w-1.5 bg-white/70" />
        <div className="absolute inset-y-0 left-2/3 w-1.5 bg-white/70" />
        <div className="absolute top-[28%] left-[12%] h-6 w-24 rounded-full bg-white/80" />
        <div className="absolute top-[18%] right-[14%] h-5 w-16 rounded-full bg-white/70" />
      </div>
      {/* Sign */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1.5 text-sm font-extrabold tracking-[0.25em] whitespace-nowrap text-brand shadow-soft sm:text-base">
        {t(rules.ui.landing.logo)}
      </div>
    </div>
  )
}

function DecisionButtons() {
  const { t } = useText()
  const enabled = useGameStore((s) => s.phase === 'inspecting' && s.answeringId === null)
  const decide = useGameStore((s) => s.decide)
  const openDenyPicker = useGameStore((s) => s.openDenyPicker)
  // Next step hint: once every needed question is asked, it's time to stamp.
  const hint = useGameStore(selectAllNeededAsked) && enabled
  const base = `min-h-16 w-40 rounded-2xl text-xl font-extrabold tracking-wide uppercase text-white shadow-soft transition-opacity disabled:cursor-not-allowed disabled:opacity-35 sm:w-48 sm:text-2xl ${
    hint ? 'animate-hint' : ''
  }`

  return (
    <div className="flex shrink-0 flex-col gap-3">
      <motion.button
        whileTap={enabled ? { scale: 0.94 } : undefined}
        disabled={!enabled}
        onClick={() => decide('APPROVE')}
        className={`${base} bg-approve [--hint:#16a34a]`}
      >
        ✔ {t(ui.approve)}
      </motion.button>
      <motion.button
        whileTap={enabled ? { scale: 0.94 } : undefined}
        disabled={!enabled}
        onClick={openDenyPicker}
        className={`${base} bg-deny [--hint:#dc2626]`}
      >
        ✖ {t(ui.deny)}
      </motion.button>
    </div>
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

export default function Game() {
  const { t, date } = useText()
  const [rulebookOpen, setRulebookOpen] = useState(false)
  const phase = useGameStore((s) => s.phase)
  const traveller = useGameStore(selectTraveller)
  const lastResult = useGameStore((s) => s.lastResult)
  const travellerArrived = useGameStore((s) => s.travellerArrived)
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

      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-w-0 flex-1 flex-col">
          {/* Traveller area */}
          <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <Backdrop />
            <Countdown />
            <div className="relative min-h-0 flex-1 pt-16">
              <AnimatePresence mode="wait">
                <Traveller
                  key={traveller.id}
                  traveller={traveller}
                  walking={phase === 'entering'}
                  onArrived={travellerArrived}
                />
              </AnimatePresence>
              <div className="absolute top-[36%] left-[calc(50%+4.5rem)] z-10">
                <SpeechBubble traveller={traveller} />
              </div>
            </div>
            <QuestionChips />
          </section>

          {/* Officer's counter */}
          <Counter>
            <div className="mb-2 flex justify-end">
              <span className="rounded-full bg-canvas px-4 py-1.5 text-base font-semibold text-ink">
                📅 {t(ui.today, { date: date(traveller.gameDate) })}
              </span>
            </div>
            <div className="flex items-end gap-5">
              <Desk key={traveller.id} traveller={traveller} />
              <DecisionButtons />
            </div>
          </Counter>

          {/* Case result over the play area once the round is scored */}
          <AnimatePresence>
            {phase === 'result' && lastResult && (
              <motion.div
                key={`result-${traveller.id}`}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center-safe overflow-y-auto bg-canvas/70 p-4 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CaseResult traveller={traveller} result={lastResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Rulebook open={rulebookOpen} onClose={() => setRulebookOpen(false)} />
      </div>

      <DenyReasonPicker traveller={traveller} />
      <StampOverlay traveller={traveller} onImpact={onStampImpact} />
      <DebugOverlay />
    </div>
    </div>
  )
}
