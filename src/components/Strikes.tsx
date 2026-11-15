import { motion } from 'framer-motion'
import { config, rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

export default function Strikes() {
  const { t } = useText()
  const strikes = useGameStore((s) => s.strikes)
  const label = t(rules.ui.game.strikes)

  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${strikes}/${config.strikesToFail}`}>
      <span className="hidden text-sm font-semibold text-muted md:inline">{label}</span>
      {Array.from({ length: config.strikesToFail }, (_, i) => {
        const hit = i < strikes
        return (
          <motion.span
            key={i}
            animate={hit ? { scale: [1.5, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`grid size-8 place-items-center rounded-lg text-base font-extrabold ${hit ? 'bg-deny text-white' : 'bg-canvas text-line'}`}
          >
            ✕
          </motion.span>
        )
      })}
    </div>
  )
}
