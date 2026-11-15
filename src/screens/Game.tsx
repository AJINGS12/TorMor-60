import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Counter from '../components/Counter'
import DebugOverlay from '../components/DebugOverlay'
import Desk from '../components/Desk'
import Traveller from '../components/Traveller'
import LanguageToggle from '../components/LanguageToggle'
import Rulebook from '../components/Rulebook'
import Strikes from '../components/Strikes'
import Timer from '../components/Timer'
import { rules } from '../engine/rules'
import { streakMultiplier } from '../engine/scoring'
import { useText } from '../i18n/useText'
import { selectIsLastRound, selectTraveller, useGameStore } from '../store/gameStore'

const ui = rules.ui.game

function TopBar({ onOpenRulebook }: { onOpenRulebook: () => void }) {
  const { t } = useText()
  const index = useGameStore((s) => s.index)
  const total = useGameStore((s) => s.travellers.length)
  const score = useGameStore((s) => s.score)
  const streak = useGameStore((s) => s.streak)
  const multiplier = streakMultiplier(streak + 1)

  return (
    <header className="relative z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-night-950/90 px-3 py-2 sm:px-5">
      <span className="rounded-full bg-night-800 px-3 py-1 text-sm font-semibold whitespace-nowrap text-slate-300">
        {t(ui.travellerCount, { n: index + 1, total })}
      </span>
      <Timer />
      <Strikes />
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{t(ui.score)}</span>
        <span className="text-2xl font-extrabold text-neon-amber tabular-nums">{score}</span>
        {multiplier > 1 && (
          <span className="rounded-full bg-neon-pink/20 px-2 py-0.5 text-xs font-bold text-neon-pink">
            🔥 {t(ui.streak, { multiplier })}
          </span>
        )}
      </div>
      <button
        onClick={onOpenRulebook}
        className="h-12 rounded-full px-4 text-sm font-semibold text-neon-amber ring-1 ring-neon-amber/50 hover:bg-neon-amber/10 lg:hidden"
      >
        📘 {t(ui.rulebook)}
      </button>
      <LanguageToggle />
    </header>
  )
}

/** Night-time airport backdrop behind the traveller. */
function Backdrop() {
  const { t } = useText()
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1f2560_0%,#0b0d2b_55%,#05061a_100%)]" />
      {/* Window onto the runway */}
      <div className="absolute inset-x-[8%] top-[12%] h-[38%] rounded-2xl border border-cyan-300/10 bg-[linear-gradient(180deg,#0a0f3a,#121a52)]">
        <div className="absolute inset-x-0 bottom-[22%] flex justify-around">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="size-1.5 rounded-full bg-neon-amber/80 shadow-[0_0_8px_#ffc53d]" />
          ))}
        </div>
        <div className="absolute inset-y-0 left-1/3 w-px bg-cyan-300/10" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-cyan-300/10" />
      </div>
      {/* Neon sign */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-lg border-2 border-neon-cyan/70 px-4 py-1 text-sm font-extrabold tracking-[0.3em] whitespace-nowrap text-neon-cyan text-glow-cyan glow-cyan sm:text-base">
        {t(rules.ui.landing.title)}
      </div>
      {/* Floor */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(180deg,transparent,#0b0d2b)]" />
    </div>
  )
}

export default function Game() {
  const { t, date } = useText()
  const [rulebookOpen, setRulebookOpen] = useState(false)
  const phase = useGameStore((s) => s.phase)
  const traveller = useGameStore(selectTraveller)
  const isLastRound = useGameStore(selectIsLastRound)
  const travellerArrived = useGameStore((s) => s.travellerArrived)
  const nextTraveller = useGameStore((s) => s.nextTraveller)

  if (!traveller) return null

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-night-950">
      <TopBar onOpenRulebook={() => setRulebookOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Traveller area */}
          <section className="relative min-h-0 flex-1 overflow-hidden">
            <Backdrop />
            <div className="absolute inset-0 pt-14">
              <AnimatePresence mode="wait">
                <Traveller
                  key={traveller.id}
                  traveller={traveller}
                  walking={phase === 'entering'}
                  onArrived={travellerArrived}
                />
              </AnimatePresence>
            </div>
          </section>

          {/* Officer's counter */}
          <Counter>
            <div className="mb-2 flex justify-end">
              <span className="rounded-md bg-black/30 px-3 py-1 text-sm font-semibold text-slate-200">
                📅 {t(ui.today, { date: date(traveller.gameDate) })}
              </span>
            </div>
            <div className="flex items-end gap-4">
              <Desk traveller={traveller} />
              {phase === 'result' && (
                <button
                  onClick={nextTraveller}
                  className="h-14 shrink-0 rounded-xl bg-neon-cyan px-6 text-lg font-extrabold text-night-950 glow-cyan"
                >
                  {t(isLastRound ? ui.finish : ui.next)}
                </button>
              )}
            </div>
          </Counter>
        </main>

        <Rulebook open={rulebookOpen} onClose={() => setRulebookOpen(false)} />
      </div>

      <DebugOverlay />
    </div>
  )
}
