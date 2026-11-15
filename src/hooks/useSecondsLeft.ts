import { useEffect, useState } from 'react'
import { config } from '../engine/rules'
import { useGameStore } from '../store/gameStore'

/** Seconds left on the current traveller's timer, updated every animation frame. */
export function useSecondsLeft(): number {
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
  return frozen ?? config.timePerTravellerSec
}
