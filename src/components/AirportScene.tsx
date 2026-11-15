import { motion } from 'framer-motion'

const CLOUDS = [
  { top: '10%', width: 140, duration: 60, delay: 0 },
  { top: '22%', width: 90, duration: 45, delay: -20 },
  { top: '6%', width: 110, duration: 75, delay: -40 },
]

/** Bright, calm airport: soft sky, drifting clouds, a plane, the terminal glass. */
export default function AirportScene() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#e6efff_0%,#f4f7fd_55%,#f7f8fa_100%)]" />

      {CLOUDS.map((c, i) => (
        <motion.div
          key={i}
          className="absolute h-8 rounded-full bg-white/90"
          style={{ top: c.top, width: c.width }}
          initial={{ x: '-20vw' }}
          animate={{ x: '110vw' }}
          transition={{ duration: c.duration, repeat: Infinity, ease: 'linear', delay: c.delay }}
        />
      ))}

      <motion.div
        className="absolute top-[16%] text-4xl opacity-70"
        initial={{ x: '-10vw', y: 30 }}
        animate={{ x: '110vw', y: -30 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
      >
        ✈️
      </motion.div>

      {/* Terminal glass wall */}
      <div className="absolute inset-x-0 bottom-[20%] flex h-[42%] justify-between px-[6%]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-full w-1.5 rounded-full bg-white/80" />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-white shadow-[0_-1px_0_rgb(17_24_39/0.06)]" />
    </div>
  )
}
