import { AnimatePresence, motion } from 'framer-motion'
import { getDenyReason, rules } from '../engine/rules'
import type { Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

/** Shown after tapping DENIED: pick one of the traveller's 4 deny reasons. */
export default function DenyReasonPicker({ traveller }: { traveller: Traveller }) {
  const { t } = useText()
  const open = useGameStore((s) => s.phase === 'choosingReason')
  const decide = useGameStore((s) => s.decide)
  const close = useGameStore((s) => s.closeDenyPicker)

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label={t(rules.ui.game.cancel)} className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lift"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="h-1.5 bg-deny" />
            <div className="p-6">
              <h2 className="mb-5 text-2xl font-extrabold text-ink">{t(rules.ui.game.chooseReason)}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {traveller.denyReasonChoices.map((id) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => decide('DENY', id)}
                    className="min-h-16 rounded-xl bg-canvas px-4 py-3 text-left text-lg leading-tight font-semibold text-ink transition-colors hover:bg-deny-50 hover:text-deny"
                  >
                    {t(getDenyReason(id))}
                  </motion.button>
                ))}
              </div>
              <button onClick={close} className="mt-4 h-12 w-full rounded-xl text-base font-semibold text-muted hover:bg-canvas">
                {t(rules.ui.game.cancel)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
