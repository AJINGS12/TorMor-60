import { motion } from 'framer-motion'

// Deterministic star field so renders stay pure.
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 37.7) % 100,
  y: (i * 23.3) % 55,
  size: 1 + (i % 3),
  delay: (i % 7) * 0.4,
}))

/** Animated night-time airport: stars, a plane crossing the sky, runway lights. */
export default function NightAirport() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2a2f7a_0%,#0b0d2b_55%,#05061a_100%)]" />

      {STARS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: s.delay }}
        />
      ))}

      {/* Plane crossing the sky with blinking lights */}
      <motion.div
        className="absolute top-[14%] text-4xl"
        initial={{ x: '-10vw', y: 30 }}
        animate={{ x: '110vw', y: -40 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
      >
        <span className="relative inline-block -rotate-6 opacity-80">
          ✈️
          <motion.span
            className="absolute -top-1 left-1 size-1.5 rounded-full bg-neon-red shadow-[0_0_8px_#ff3b5c]"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </span>
      </motion.div>

      {/* Terminal glass wall */}
      <div className="absolute inset-x-0 bottom-[22%] h-px bg-cyan-300/20" />
      <div className="absolute inset-x-0 bottom-[22%] flex h-[40%] justify-between px-[5%]">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-full w-px bg-cyan-300/10" />
        ))}
      </div>

      {/* Runway lights chasing */}
      <div className="absolute inset-x-0 bottom-[24%] flex justify-around px-4">
        {Array.from({ length: 18 }, (_, i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-neon-amber shadow-[0_0_10px_#ffc53d]"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>

      {/* Floor with neon reflection */}
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[linear-gradient(180deg,#141842,#05061a)]">
        <div className="h-0.5 bg-neon-pink/70 shadow-[0_0_16px_rgb(255_63_164/0.9)]" />
      </div>
    </div>
  )
}
