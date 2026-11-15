import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { getQuestion, rules } from '../engine/rules'
import type { Traveller } from '../engine/types'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'
import DecisionButtons from './DecisionButtons'
import QuestionChips from './QuestionChips'
import SpeechBubble, { TypingDots } from './SpeechBubble'

const ui = rules.ui.game

/** Messaging-style log of the interview so far. Auto-scrolls; players can scroll back. */
function ChatLog({ traveller }: { traveller: Traveller }) {
  const { t } = useText()
  const asked = useGameStore((s) => s.askedQuestionIds)
  const answeringId = useGameStore((s) => s.answeringId)
  const lastAnsweredId = useGameStore((s) => s.lastAnsweredId)
  const reviewCount = useGameStore((s) => s.reviewCount)
  const scroller = useRef<HTMLDivElement>(null)

  // Follow the conversation as it grows.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [asked.length, answeringId])

  // Tapping an already-asked question scrolls back to (and highlights) its answer.
  useEffect(() => {
    if (!reviewCount || !lastAnsweredId) return
    scroller.current?.querySelector(`[data-answer="${lastAnsweredId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [reviewCount, lastAnsweredId])

  return (
    <div
      ref={scroller}
      // Soft fade at the top so messages scroll away gently under the heading.
      className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3 [mask-image:linear-gradient(to_bottom,transparent,black_20px)]"
      aria-live="polite"
    >
      {asked.length === 0 && !answeringId && (
        <p className="m-auto max-w-[16rem] text-center text-base text-muted">💬 {t(ui.chatEmpty)}</p>
      )}
      <AnimatePresence initial={false}>
        {asked.flatMap((id) => [
          <SpeechBubble key={`${id}-q`} from="officer">
            {t(getQuestion(id))}
          </SpeechBubble>,
          <SpeechBubble key={`${id}-a`} from="traveller" answerOf={id} highlight={id === lastAnsweredId}>
            {t(traveller.answers[id].text)}
          </SpeechBubble>,
        ])}
        {answeringId && [
          <SpeechBubble key={`${answeringId}-q`} from="officer">
            {t(getQuestion(answeringId))}
          </SpeechBubble>,
          <SpeechBubble key={`${answeringId}-typing`} from="traveller">
            <span aria-label={t(ui.answering)}>
              <TypingDots />
            </span>
          </SpeechBubble>,
        ]}
      </AnimatePresence>
    </div>
  )
}

/**
 * Right-hand interview panel: chat log, question list, and the decision buttons.
 * On narrow screens the buttons are pinned to the bottom of the screen instead.
 */
export default function InterviewPanel({ traveller }: { traveller: Traveller }) {
  const { t } = useText()
  return (
    <section className="flex shrink-0 flex-col bg-white lg:min-h-0 lg:flex-1 lg:shrink lg:shadow-[-8px_0_30px_rgb(17_24_39/0.06)]">
      <h2 className="shrink-0 px-4 pt-3 text-sm font-semibold text-muted">💬 {t(ui.interview)}</h2>
      {/* Chat gets a fixed height when stacked (page scrolls), and the spare height side-by-side. */}
      <div className="flex h-64 shrink-0 flex-col lg:h-auto lg:min-h-36 lg:flex-1 lg:basis-0">
        <ChatLog key={traveller.id} traveller={traveller} />
      </div>
      {/* Side-by-side: if the questions don't fit, only this list scrolls. */}
      <div className="flex shrink-0 flex-col border-t border-line lg:max-h-[58%] lg:min-h-0 lg:shrink">
        <div className="shrink-0 px-4 pt-3 pb-1.5 text-sm font-semibold text-muted">{t(ui.askQuestion)}</div>
        <div className="min-h-0 overflow-y-auto px-3 pt-0.5 pb-3 [scrollbar-width:thin]">
          <QuestionChips />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 shrink-0 bg-white/95 px-3 pt-2 pb-3 shadow-[0_-8px_24px_rgb(17_24_39/0.08)] backdrop-blur lg:static lg:bg-white lg:shadow-none">
        <DecisionButtons />
      </div>
    </section>
  )
}
