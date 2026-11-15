import { rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { useSoundStore } from '../store/soundStore'

export default function MuteToggle() {
  const { t } = useText()
  const muted = useSoundStore((s) => s.muted)
  const toggleMute = useSoundStore((s) => s.toggleMute)
  const label = t(muted ? rules.ui.game.unmute : rules.ui.game.mute)
  return (
    <button
      onClick={toggleMute}
      aria-label={label}
      aria-pressed={muted}
      title={label}
      className="grid size-12 place-items-center rounded-full bg-canvas text-xl transition-colors hover:bg-line"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
