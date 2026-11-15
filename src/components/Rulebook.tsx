import { AnimatePresence, motion } from 'framer-motion'
import { rules } from '../engine/rules'
import { useText } from '../i18n/useText'

function RulebookContent() {
  const { t } = useText()
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <h2 className="text-xl font-extrabold text-ink">📘 {t(rules.ui.game.rulebook)}</h2>
      <ul className="flex flex-col gap-3">
        {rules.ui.rules.checklist.map((item, i) => (
          <li key={i} className="flex gap-3 text-base leading-snug text-ink">
            <span className="mt-0.5 font-bold text-brand">✓</span>
            <span>{t(item)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto text-xs leading-relaxed text-muted">{t(rules.meta.disclaimer)}</p>
    </div>
  )
}

/**
 * Rulebook checklist. Always visible as a side panel on large screens;
 * a slide-over drawer (toggled by `open`) on smaller ones.
 */
export default function Rulebook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useText()
  return (
    <>
      <aside className="hidden w-80 shrink-0 overflow-y-auto bg-white shadow-[-8px_0_30px_rgb(17_24_39/0.05)] xl:block">
        <RulebookContent />
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label={t(rules.ui.game.close)} className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={onClose} />
            <motion.aside
              className="absolute inset-y-0 right-0 w-[min(22rem,90vw)] overflow-y-auto bg-white shadow-lift"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-12 min-w-12 rounded-full bg-canvas px-4 text-sm font-semibold text-ink hover:bg-line"
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
