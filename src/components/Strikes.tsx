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
      <span className="hidden text-xs font-semibold tracking-wider text-slate-400 uppercase sm:inline">{label}</span>
      {Array.from({ length: config.strikesToFail }, (_, i) => {
        const hit = i < strikes
        return (
          <motion.span
            key={i}
            animate={hit ? { scale: [1.8, 1], rotate: [-20, 0] } : { scale: 1 }}
            className={`grid size-8 place-items-center rounded-md text-lg font-extrabold ${
              hit ? 'bg-neon-red/20 text-neon-red glow-red' : 'bg-night-800 text-slate-600 ring-1 ring-white/10'
            }`}
          >
            ✕
          </motion.span>
        )
      })}
    </div>
  )
}
