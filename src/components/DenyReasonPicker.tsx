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
          <button aria-label={t(rules.ui.game.cancel)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl bg-night-900 p-5 ring-2 ring-neon-red/70 glow-red"
            initial={{ y: 40, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.95 }}
          >
            <h2 className="mb-4 text-2xl font-extrabold text-neon-red">{t(rules.ui.game.chooseReason)}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {traveller.denyReasonChoices.map((id) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => decide('DENY', id)}
                  className="min-h-16 rounded-xl bg-night-800 px-4 py-3 text-left text-lg leading-tight font-semibold text-white ring-1 ring-white/15 hover:bg-neon-red/15 hover:ring-neon-red"
                >
                  {t(getDenyReason(id))}
                </motion.button>
              ))}
            </div>
            <button
              onClick={close}
              className="mt-4 h-12 w-full rounded-xl text-base font-semibold text-slate-300 ring-1 ring-white/20 hover:bg-white/10"
            >
              {t(rules.ui.game.cancel)}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
