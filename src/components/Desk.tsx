import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { deskDocuments, type DeskSlot } from '../engine/desk'
import { rules } from '../engine/rules'
import type { Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'
import DocumentCard, { DocumentThumb } from './DocumentCard'
import { StampMark } from './Stamp'

const ui = rules.ui.game

/** Documents on the officer's desk. Tap one to zoom in. */
export default function Desk({ traveller }: { traveller: Traveller }) {
  const { t } = useText()
  const phase = useGameStore((s) => s.phase)
  const asked = useGameStore((s) => s.askedQuestionIds)
  const [zoomed, setZoomed] = useState<DeskSlot | null>(null)
  const lastDecision = useGameStore((s) => s.lastResult?.decision)
  // The passport shows its stamp once the slam animation has played.
  const stamped = phase === 'result' && lastDecision && lastDecision !== 'TIMEOUT' ? lastDecision : null

  // Nothing is handed over until the traveller reaches the counter.
  const docs = phase === 'entering' ? [] : deskDocuments(traveller, asked)
  const zoomedDoc = docs.find((d) => d.slot === zoomed)

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
        {t(ui.desk)} · <span className="normal-case">{t(ui.tapToZoom)}</span>
      </div>
      <div className="flex min-h-28 gap-3 overflow-x-auto pb-1">
        <AnimatePresence>
          {docs.map((doc, i) => (
            <motion.button
              key={`${traveller.id}-${doc.slot}`}
              layoutId={`${traveller.id}-${doc.slot}`}
              onClick={() => setZoomed(doc.slot)}
              initial={{ y: -140, opacity: 0, rotate: -12 }}
              animate={{ y: 0, opacity: 1, rotate: i % 2 ? 2 : -2 }}
              exit={{ y: -140, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 220 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              className="relative h-28 w-40 shrink-0 cursor-zoom-in sm:w-44"
            >
              <DocumentThumb traveller={traveller} doc={doc} />
              {doc.slot === 'passport' && stamped && (
                <div className="absolute right-1 bottom-2 -rotate-12">
                  <StampMark decision={stamped} size="sm" />
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {zoomedDoc && (
          <motion.div
            className="fixed inset-0 z-40 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button aria-label={t(ui.close)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setZoomed(null)} />
            <motion.div layoutId={`${traveller.id}-${zoomedDoc.slot}`} className="relative w-full max-w-xl">
              <DocumentCard traveller={traveller} doc={zoomedDoc} />
              <button
                onClick={() => setZoomed(null)}
                className="mt-3 h-12 w-full rounded-xl bg-night-800 text-base font-semibold text-white ring-1 ring-white/20 hover:bg-night-700"
              >
                {t(ui.close)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
