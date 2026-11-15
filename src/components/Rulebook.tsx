import { AnimatePresence, motion } from 'framer-motion'
import { rules } from '../engine/rules'
import { useText } from '../i18n/useText'

function RulebookContent() {
  const { t } = useText()
  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <h2 className="text-xl font-extrabold text-neon-amber">📘 {t(rules.ui.game.rulebook)}</h2>
      <ul className="flex flex-col gap-3">
        {rules.ui.rules.checklist.map((item, i) => (
          <li key={i} className="flex gap-3 text-base leading-snug text-slate-200">
            <span className="mt-0.5 text-neon-cyan">✔</span>
            <span>{t(item)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto text-xs leading-relaxed text-slate-500">{t(rules.meta.disclaimer)}</p>
    </div>
  )
}

/**
 * Rulebook checklist. Always visible as a side panel on large screens;
 * a slide-over drawer (toggled by `open`) on small screens.
 */
export default function Rulebook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useText()
  return (
    <>
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-white/10 bg-night-900/80 lg:block">
        <RulebookContent />
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label={t(rules.ui.game.close)} className="absolute inset-0 bg-black/60" onClick={onClose} />
            <motion.aside
              className="absolute inset-y-0 right-0 w-[min(22rem,90vw)] overflow-y-auto border-l border-neon-amber/40 bg-night-900"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 h-12 min-w-12 rounded-full px-4 text-sm font-semibold text-slate-300 ring-1 ring-white/20 hover:bg-white/10"
              >
                {t(rules.ui.game.close)}
              </button>
              <RulebookContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
