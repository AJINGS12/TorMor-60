import { AnimatePresence } from 'framer-motion'
import hallPhoto from '../assets/scene/airport-hall.webp'
import { rules } from '../engine/rules'
import type { Traveller as TravellerData } from '../engine/types'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'
import Countdown from './Countdown'
import Traveller from './Traveller'

/** Queue barrier: two chrome posts with a sagging navy rope, behind the traveller. */
function QueueRope() {
  return (
    <svg aria-hidden viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-x-[6%] bottom-[14%] h-[16%] w-[88%] opacity-80">
      <path d="M40 30 Q270 95 500 30 Q730 95 960 30" fill="none" stroke="#1e3a8a" strokeWidth="9" strokeLinecap="round" />
      {[40, 500, 960].map((x) => (
        <g key={x}>
          <rect x={x - 7} y="22" width="14" height="94" rx="6" fill="#cbd5e1" />
          <rect x={x - 3} y="24" width="4" height="88" rx="2" fill="#f8fafc" opacity="0.8" />
          <circle cx={x} cy="22" r="11" fill="#94a3b8" />
          <ellipse cx={x} cy="116" rx="26" ry="5" fill="#94a3b8" />
        </g>
      ))}
    </svg>
  )
}

/** Booth glass in the foreground: thin navy frame plus soft reflections. */
function BoothGlass() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-2 z-20 rounded-2xl border-[5px] border-brand/85 shadow-[inset_0_0_40px_rgb(30_58_138/0.12)]">
      <div className="absolute inset-0 rounded-xl bg-[linear-gradient(115deg,rgb(255_255_255/0.28)_0%,rgb(255_255_255/0)_28%,rgb(255_255_255/0)_58%,rgb(255_255_255/0.16)_66%,rgb(255_255_255/0)_74%)]" />
      {/* Speaking slot at the bottom of the glass */}
      <div className="absolute bottom-0 left-1/2 h-2 w-28 -translate-x-1/2 rounded-t-md bg-brand/85" />
    </div>
  )
}

/** The view through the booth window: blurred arrivals hall, queue rope, the traveller. */
export default function GameScene({ traveller }: { traveller: TravellerData }) {
  const { t } = useText()
  const phase = useGameStore((s) => s.phase)
  const talking = useGameStore((s) => s.answeringId !== null)
  const travellerArrived = useGameStore((s) => s.travellerArrived)

  return (
    <section className="relative min-h-0 overflow-hidden bg-canvas">
      {/* Photo background: blurred for depth, washed out so the flat traveller stays the focus */}
      <img src={hallPhoto} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-[3px]" />
      <div className="absolute inset-0 bg-white/40" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white via-white/70 to-transparent" />

      <div className="absolute top-5 left-6 z-10 rounded-md bg-brand px-3 py-1.5 text-xs font-bold tracking-wider text-white shadow-soft sm:text-sm">
        ✈ {t(rules.ui.game.arrivalsSign)}
      </div>

      <QueueRope />
      <Countdown />

      <div className="absolute inset-x-0 top-6 bottom-3 z-10 flex justify-center">
        <AnimatePresence mode="wait">
          <Traveller key={traveller.id} traveller={traveller} walking={phase === 'entering'} talking={talking} onArrived={travellerArrived} />
        </AnimatePresence>
      </div>

      <BoothGlass />
    </section>
  )
}
