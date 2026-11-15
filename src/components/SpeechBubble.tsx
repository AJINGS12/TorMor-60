import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function TypingDots() {
  return (
    <span className="flex gap-1.5 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2.5 rounded-full bg-muted"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

/**
 * One chat message in the interview log, messaging-app style:
 * officer on the right (navy), traveller on the left (grey).
 */
export default function SpeechBubble({
  from,
  children,
  highlight = false,
  answerOf,
}: {
  from: 'officer' | 'traveller'
  children: ReactNode
  highlight?: boolean
  /** Question id this bubble answers (lets the chat scroll back to it). */
  answerOf?: string
}) {
  const officer = from === 'officer'
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      data-answer={answerOf}
      className={`flex ${officer ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-snug break-words transition-shadow ${
          officer ? 'rounded-br-md bg-brand text-base text-white' : 'rounded-bl-md bg-canvas text-lg font-medium text-ink'
        } ${highlight ? 'ring-2 ring-brand/40' : ''}`}
      >
        {children}
      </div>
    </motion.div>
  )
}
