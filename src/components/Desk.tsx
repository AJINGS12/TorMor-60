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
  const openedDocs = useGameStore((s) => s.openedDocs)
  const markDocOpened = useGameStore((s) => s.markDocOpened)
  const hints = ui.docHints as Record<string, { en: string; th: string } | undefined>
  /** "Tap me" hint for documents listed in ui.game.docHints, until first opened. */
  const hintFor = (slot: DeskSlot) => {
    const h = hints[slot]
    return h && !openedDocs.includes(slot) && phase === 'inspecting' ? t(h) : undefined
  }
  const lastDecision = useGameStore((s) => s.lastResult?.decision)
  // The passport shows its stamp once the slam animation has played.
  const stamped = phase === 'result' && lastDecision && lastDecision !== 'TIMEOUT' ? lastDecision : null

  // Nothing is handed over until the traveller reaches the counter.
  const docs = phase === 'entering' ? [] : deskDocuments(traveller, asked)
  const zoomedDoc = docs.find((d) => d.slot === zoomed)

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 text-sm font-semibold text-muted">
        {t(ui.desk)} · <span className="font-normal">{t(ui.tapToZoom)}</span>
      </div>
      <div className="-my-3 flex min-h-28 gap-3 overflow-x-auto overflow-y-hidden py-3">
        <AnimatePresence>
          {docs.map((doc, i) => (
            <motion.button
              key={`${traveller.id}-${doc.slot}`}
              layoutId={`${traveller.id}-${doc.slot}`}
              onClick={() => {
                setZoomed(doc.slot)
                markDocOpened(doc.slot)
              }}
              initial={{ y: -120, opacity: 0, rotate: -6 }}
              animate={{ y: 0, opacity: 1, rotate: i % 2 ? 1 : -1 }}
              exit={{ y: -140, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              className="relative h-28 w-40 shrink-0 cursor-zoom-in sm:w-44"
            >
              <DocumentThumb traveller={traveller} doc={doc} hint={hintFor(doc.slot)} />
              {doc.slot === 'passport' && stamped && (
                <div className="absolute top-1/2 right-1 -translate-y-1/2 -rotate-12">
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
            <button aria-label={t(ui.close)} className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={() => setZoomed(null)} />
            <motion.div layoutId={`${traveller.id}-${zoomedDoc.slot}`} className="relative w-full max-w-xl">
              <DocumentCard traveller={traveller} doc={zoomedDoc} />
              <button
                onClick={() => setZoomed(null)}
                className="mt-3 h-14 w-full rounded-2xl bg-white text-lg font-semibold text-ink shadow-soft hover:bg-canvas"
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
