import { useEffect } from 'react'
import { config } from '../engine/rules'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const
// The game always opens (and resets) in English; players switch with the EN/TH toggle.
const DEFAULT_LANG = 'en'

/**
 * Booth safety net: after config.idleResetSec with no input on any screen
 * other than Landing, drop the abandoned session and go back to Landing.
 */
export default function IdleReset() {
  const screen = useGameStore((s) => s.screen)
  const reset = useGameStore((s) => s.reset)
  const { setLang } = useText()

  useEffect(() => {
    if (screen === 'landing') return
    let timer: ReturnType<typeof setTimeout>
    const restart = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        reset()
        setLang(DEFAULT_LANG)
      }, config.idleResetSec * 1000)
    }
    restart()
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, restart, { passive: true }))
    return () => {
      clearTimeout(timer)
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, restart))
    }
  }, [screen, reset, setLang])

  return null
}
