import { motion, useIsPresent, type Variants } from 'framer-motion'
import { rules } from '../engine/rules'
import type { Traveller as TravellerData } from '../engine/types'
import { useText } from '../i18n/useText'
import Avatar from './Avatar'

const walk: Variants = {
  hidden: { x: '-70vw', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 1.4, ease: 'easeOut' } },
  exit: { x: '70vw', opacity: 0, transition: { duration: 1.1, ease: 'easeIn' } },
}

/** The traveller: walks in from the left, walks off to the right. */
export default function Traveller({
  traveller,
  walking,
  onArrived,
}: {
  traveller: TravellerData
  walking: boolean
  onArrived: () => void
}) {
  const { t } = useText()
  const present = useIsPresent()
  const isWalking = walking || !present
  const persona = rules.personas[traveller.purpose]

  return (
    <motion.div
      variants={walk}
      initial="hidden"
      animate="visible"
      exit="exit"
      onAnimationComplete={(definition) => definition === 'visible' && onArrived()}
      className="flex h-full flex-col items-center justify-end"
    >
      {/* Tag above the head */}
      <div className="mb-1 flex items-center gap-2 rounded-full bg-night-900/90 px-3 py-1.5 text-sm font-semibold whitespace-nowrap ring-1 ring-neon-cyan/50 glow-cyan sm:text-base">
        <span className="text-xl leading-none">{traveller.country.flag}</span>
        <span className="text-white">{t(traveller.country)}</span>
        <span className="text-neon-cyan">· {t(persona)}</span>
      </div>

      <motion.div
        animate={isWalking ? { y: [0, -8, 0], rotate: [-2, 2, -2] } : { y: [0, -2, 0], rotate: 0 }}
        transition={{ duration: isWalking ? 0.45 : 3, repeat: Infinity, ease: 'easeInOut' }}
        className="h-[min(78%,300px)] min-h-32"
      >
        <Avatar seed={traveller.avatarSeed} purpose={traveller.purpose} className="h-full w-auto drop-shadow-[0_0_24px_rgb(34_228_255/0.25)]" />
      </motion.div>
    </motion.div>
  )
}
