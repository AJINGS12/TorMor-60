import { motion } from 'framer-motion'
import type { LocalizedText } from '../engine/types'
import { useText } from '../i18n/useText'

/** Consequence "news" headline shown after a mistake. */
export default function Headline({ headline }: { headline: LocalizedText }) {
  const { t } = useText()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.6, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: -2 }}
      transition={{ delay: 0.35, type: 'spring', damping: 14, stiffness: 180 }}
      className="rounded-md bg-[#f4efe1] px-4 py-3 font-extrabold text-slate-900 shadow-[0_10px_30px_rgb(0_0_0/0.5)] ring-1 ring-black/10"
    >
      <div className="mb-1 h-1 w-full bg-slate-900" />
      <p className="text-lg leading-snug sm:text-xl">{t(headline)}</p>
      <div className="mt-1 h-0.5 w-full bg-slate-900" />
    </motion.div>
  )
}
