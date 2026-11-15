import { questionsFor } from '../engine/requirements'
import { useText } from '../i18n/useText'
import { selectTraveller, useGameStore } from '../store/gameStore'

/**
 * Compact question list in the interview panel: icon + short label.
 * Asked questions get a ✓ and turn grey; everything locks while the traveller answers.
 */
export default function QuestionChips() {
  const { lang } = useText()
  const phase = useGameStore((s) => s.phase)
  const asked = useGameStore((s) => s.askedQuestionIds)
  const answeringId = useGameStore((s) => s.answeringId)
  const askQuestion = useGameStore((s) => s.askQuestion)
  const traveller = useGameStore(selectTraveller)
  // Some questions only apply to some travellers (e.g. proof of study for students).
  const questions = traveller ? questionsFor(traveller) : []
  const locked = phase !== 'inspecting' || answeringId !== null
  // Next step hint: at the start of each traveller, the questions are the thing to tap.
  const hint = phase === 'inspecting' && asked.length === 0 && answeringId === null

  return (
    <div className={`grid grid-cols-2 gap-2 rounded-2xl p-1 ${hint ? 'animate-hint-glow' : ''}`}>
      {questions.map((q) => {
        const isAsked = asked.includes(q.id)
        const isAnswering = answeringId === q.id
        return (
          <button
            key={q.id}
            onClick={() => askQuestion(q.id)}
            disabled={locked || isAsked}
            aria-pressed={isAsked}
            title={lang === 'th' ? q.th : q.en}
            className={`flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-left text-base leading-tight font-semibold transition-colors ${
              isAnswering
                ? 'bg-brand text-white'
                : isAsked
                  ? 'bg-canvas text-muted'
                  : 'bg-brand-50 text-brand hover:bg-brand-100'
            } disabled:cursor-not-allowed ${locked && !isAnswering && !isAsked ? 'opacity-50' : ''}`}
          >
            <span className="shrink-0 text-lg">{isAsked ? '✓' : q.icon}</span>
            <span className="min-w-0">{lang === 'th' ? q.shortTh : q.shortEn}</span>
          </button>
        )
      })}
    </div>
  )
}
