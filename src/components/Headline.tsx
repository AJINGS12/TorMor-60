import { motion } from 'framer-motion'
import type { LocalizedText } from '../engine/types'
import { useText } from '../i18n/useText'

/** Consequence "news" headline shown after a mistake. */
export default function Headline({ headline }: { headline: LocalizedText }) {
  const { t } = useText()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl bg-[#fffdf6] px-5 py-4 text-ink shadow-soft"
    >
      <div className="mb-2 h-1 w-full rounded-full bg-ink" />
      <p className="text-lg leading-snug font-extrabold sm:text-xl">{t(headline)}</p>
      <div className="mt-2 h-0.5 w-full rounded-full bg-ink/60" />
    </motion.div>
  )
}
