import { useEffect, useState } from 'react'
import { config, rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

const TOTAL = config.timePerTravellerSec

/** Seconds left on the current traveller's timer, updated every animation frame. */
function useSecondsLeft(): number {
  const deadline = useGameStore((s) => s.deadline)
  const frozen = useGameStore((s) => s.frozenSecondsLeft)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (deadline === null) return
    let frame = requestAnimationFrame(function tick() {
      setNow(Date.now())
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [deadline])

  if (deadline !== null) return Math.max(0, (deadline - now) / 1000)
  return frozen ?? TOTAL
}

export default function Timer() {
  const { t } = useText()
  const secondsLeft = useSecondsLeft()
  const warning = secondsLeft <= config.timerWarningSec
  const fraction = secondsLeft / TOTAL

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3" role="timer" aria-live="off">
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-night-800 ring-1 ring-white/10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-colors duration-300 ${
            warning ? 'bg-neon-red glow-red' : 'bg-neon-cyan glow-cyan'
          }`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <span
        className={`w-16 text-right text-2xl font-extrabold tabular-nums ${
          warning ? 'animate-pulse text-neon-red' : 'text-neon-cyan text-glow-cyan'
        }`}
      >
        {t(rules.ui.game.seconds, { seconds: Math.ceil(secondsLeft) })}
      </span>
    </div>
  )
}
