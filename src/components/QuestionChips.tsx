import { questionsFor } from '../engine/requirements'
import { useText } from '../i18n/useText'
import { selectTraveller, useGameStore } from '../store/gameStore'

/**
 * Question list in the interview panel: slim rows with a small icon and the full question.
 * Text wraps (never truncated). Asked questions get a ✓ and grey text, and stay
 * tappable to re-show their answer in the chat. Everything locks while the traveller answers.
 */
export default function QuestionChips() {
  const { t } = useText()
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
    <ul className={`flex flex-col gap-1.5 rounded-xl ${hint ? 'animate-hint-glow' : ''}`}>
      {questions.map((q) => {
        const isAsked = asked.includes(q.id)
        const isAnswering = answeringId === q.id
        return (
          <li key={q.id}>
            <button
              onClick={() => askQuestion(q.id)}
              disabled={locked}
              aria-pressed={isAsked}
              data-question={q.id}
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-[10px] border px-3 py-2 text-left text-[15px] leading-snug font-medium transition-colors sm:text-base ${
                isAnswering
                  ? 'border-brand bg-brand text-white'
                  : isAsked
                    ? 'border-line bg-white text-muted hover:bg-brand-50'
                    : 'border-line bg-white text-ink hover:border-brand-100 hover:bg-brand-50 active:bg-brand-50'
              } disabled:cursor-not-allowed ${locked && !isAnswering ? 'opacity-50' : ''}`}
            >
              <span aria-hidden className="w-6 shrink-0 text-center text-base leading-none">
                {q.icon}
              </span>
              <span className="min-w-0 flex-1 break-words">{t(q)}</span>
              {isAsked && (
                <span aria-hidden className="shrink-0 font-bold text-brand">
                  ✓
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
