import { motion, useIsPresent, type Variants } from 'framer-motion'
import { rules } from '../engine/rules'
import type { Traveller as TravellerData } from '../engine/types'
import { useText } from '../i18n/useText'
import Avatar from './Avatar'
import Flag from './Flag'

const walk: Variants = {
  hidden: { x: '-70vw', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 1.1, ease: 'easeOut' } },
  exit: { x: '70vw', opacity: 0, transition: { duration: 0.9, ease: 'easeIn' } },
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
      {/* Tag above the head: never shrinks, so it is always fully visible. */}
      <div className="mb-2 flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-base font-semibold whitespace-nowrap shadow-soft sm:text-lg">
        <Flag code={traveller.country.code} className="h-5" />
        <span className="text-ink">{t(traveller.country)}</span>
        <span className="text-brand">· {t(persona)}</span>
      </div>

      <motion.div
        animate={isWalking ? { y: [0, -8, 0], rotate: [-2, 2, -2] } : { y: [0, -2, 0], rotate: 0 }}
        transition={{ duration: isWalking ? 0.45 : 3, repeat: Infinity, ease: 'easeInOut' }}
        // Avatar takes whatever height is left (up to 300px) and shrinks on short screens.
        className="flex min-h-0 max-h-[300px] w-full flex-1 justify-center"
      >
        <Avatar seed={traveller.avatarSeed} purpose={traveller.purpose} className="h-full w-auto drop-shadow-[0_10px_16px_rgb(17_24_39/0.12)]" />
      </motion.div>
    </motion.div>
  )
}
