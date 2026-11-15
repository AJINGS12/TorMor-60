import { motion } from 'framer-motion'
import { rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { selectAllNeededAsked, useGameStore } from '../store/gameStore'

const ui = rules.ui.game

/** APPROVED / DENIED, side by side. Pulses once every needed question is asked. */
export default function DecisionButtons() {
  const { t } = useText()
  const enabled = useGameStore((s) => s.phase === 'inspecting' && s.answeringId === null)
  const decide = useGameStore((s) => s.decide)
  const openDenyPicker = useGameStore((s) => s.openDenyPicker)
  const hint = useGameStore(selectAllNeededAsked) && enabled
  const base = `min-h-16 rounded-2xl px-2 text-xl font-extrabold tracking-wide uppercase text-white shadow-soft transition-opacity disabled:cursor-not-allowed disabled:opacity-35 ${
    hint ? 'animate-hint' : ''
  }`

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.button
        whileTap={enabled ? { scale: 0.96 } : undefined}
        disabled={!enabled}
        onClick={() => decide('APPROVE')}
        className={`${base} bg-approve [--hint:#16a34a]`}
      >
        ✓ {t(ui.approve)}
      </motion.button>
      <motion.button
        whileTap={enabled ? { scale: 0.96 } : undefined}
        disabled={!enabled}
        onClick={openDenyPicker}
        className={`${base} bg-deny [--hint:#dc2626]`}
      >
        ✕ {t(ui.deny)}
      </motion.button>
    </div>
  )
}
