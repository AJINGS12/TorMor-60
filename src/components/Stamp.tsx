import { motion } from 'framer-motion'
import { rules } from '../engine/rules'
import type { Decision } from '../engine/types'
import { useText } from '../i18n/useText'

/** Stamp ink: green only for APPROVED, red only for DENIED. */
const INK: Record<Decision, string> = { APPROVE: '#16a34a', DENY: '#dc2626' }

/** The inked stamp mark (static). */
export function StampMark({ decision, size = 'lg' }: { decision: Decision; size?: 'sm' | 'lg' }) {
  const { t } = useText()
  const ink = INK[decision]
  const label = t(decision === 'APPROVE' ? rules.ui.game.approve : rules.ui.game.deny)
  return (
    <div
      className={`rounded-xl font-extrabold tracking-widest whitespace-nowrap uppercase opacity-90 mix-blend-multiply ${
        size === 'lg' ? 'border-[6px] px-6 py-2 text-5xl sm:text-6xl' : 'border-[3px] px-2 py-0.5 text-xs'
      }`}
      style={{ color: ink, borderColor: ink }}
    >
      {label}
    </div>
  )
}

/** Fixed, irregular-looking droplet pattern (deterministic so renders stay pure). */
const DROPS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2 + ((i * 37) % 10) / 25
  const dist = 90 + ((i * 53) % 11) * 10
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.6, r: 6 + ((i * 29) % 7) * 2 }
})

/** Ink droplets bursting out from the impact point. */
export function InkSplash({ color }: { color: string }) {
  const drops = DROPS
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2">
      {drops.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: d.r, height: d.r, marginLeft: -d.r / 2, marginTop: -d.r / 2, background: color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: d.x, y: d.y, scale: [0, 1.3, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
      <motion.span
        className="absolute -mt-24 -ml-24 size-48 rounded-full"
        style={{ border: `3px solid ${color}`, opacity: 0.5 }}
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

/**
 * The stamp slamming down. Calls `onImpact` when it hits (for the screen shake)
 * and `onDone` once the moment has played out.
 */
export function StampSlam({ decision, onImpact, onDone }: { decision: Decision; onImpact: () => void; onDone: () => void }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 z-10"
      initial={{ x: '-50%', y: '-50%', scale: 3.2, rotate: -28, opacity: 0 }}
      animate={{ x: '-50%', y: '-50%', scale: 1, rotate: -12, opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.2, ease: [0.6, 0, 1, 1] }}
      onAnimationComplete={() => {
        onImpact()
        setTimeout(onDone, 1100)
      }}
    >
      <StampMark decision={decision} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0 }}>
        <InkSplash color={INK[decision]} />
      </motion.div>
    </motion.div>
  )
}
