import { create } from 'zustand'
import { generateShift } from '../engine/generateTraveller'
import { evaluate } from '../engine/requirements'
import { config, rules } from '../engine/rules'
import { isFired } from '../engine/scoring'
import type { Decision, DenyReasonId, LocalizedText, QuestionId, RoundResult, Traveller } from '../engine/types'

export const SCREENS = ['landing', 'nickname', 'rules', 'game', 'end'] as const
export type Screen = (typeof SCREENS)[number]

/**
 * Round lifecycle:
 * entering → inspecting ⇄ choosingReason → stamping → result → (next traveller | end)
 * A timeout skips straight to result.
 */
export type Phase = 'idle' | 'entering' | 'inspecting' | 'choosingReason' | 'stamping' | 'result'

interface GameState {
  screen: Screen
  phase: Phase
  travellers: Traveller[]
  index: number
  /** Epoch ms when the current traveller's timer runs out (null when not running). */
  deadline: number | null
  /** Seconds left, frozen when the round ends. */
  frozenSecondsLeft: number | null
  askedQuestionIds: QuestionId[]
  /** Question the traveller is currently answering (chips disabled meanwhile). */
  answeringId: QuestionId | null
  /** Most recently answered question, shown in the speech bubble. */
  lastAnsweredId: QuestionId | null
  results: RoundResult[]
  lastResult: RoundResult | null
  headline: LocalizedText | null
  score: number
  streak: number
  strikes: number

  setScreen: (screen: Screen) => void
  nextScreen: () => void
  reset: () => void

  startGame: () => void
  travellerArrived: () => void
  askQuestion: (id: QuestionId) => void
  openDenyPicker: () => void
  closeDenyPicker: () => void
  decide: (decision: Decision, denyReasonId?: DenyReasonId | null) => void
  stampFinished: () => void
  nextTraveller: () => void
}

// Timers live outside the state so they never trigger renders.
let roundTimer: ReturnType<typeof setTimeout> | undefined
let answerTimer: ReturnType<typeof setTimeout> | undefined
function clearTimers() {
  clearTimeout(roundTimer)
  clearTimeout(answerTimer)
}

const roundReset = {
  deadline: null,
  frozenSecondsLeft: null,
  askedQuestionIds: [],
  answeringId: null,
  lastAnsweredId: null,
  lastResult: null,
  headline: null,
} satisfies Partial<GameState>

const gameReset = {
  ...roundReset,
  phase: 'idle',
  travellers: [],
  index: 0,
  results: [],
  score: 0,
  streak: 0,
  strikes: 0,
} satisfies Partial<GameState>

function pickHeadline(result: RoundResult): LocalizedText | null {
  const h = rules.consequenceHeadlines
  const list =
    result.outcome === 'timeout'
      ? h.timeout
      : result.outcome === 'wrong'
        ? result.decision === 'APPROVE'
          ? h.wrongApprove
          : h.wrongDeny
        : []
  return list.length ? list[Math.floor(Math.random() * list.length)] : null
}

export const useGameStore = create<GameState>()((set, get) => {
  /** Scores the round. `TIMEOUT` is used when the timer runs out. */
  function finishRound(decision: Decision | 'TIMEOUT', denyReasonId: DenyReasonId | null) {
    const s = get()
    if (s.phase !== 'inspecting' && s.phase !== 'choosingReason') return
    clearTimers()
    const traveller = s.travellers[s.index]
    const secondsLeft = decision === 'TIMEOUT' ? 0 : Math.max(0, ((s.deadline ?? Date.now()) - Date.now()) / 1000)
    const result = evaluate(traveller, decision, denyReasonId, s.askedQuestionIds, secondsLeft, s.streak)
    set({
      phase: decision === 'TIMEOUT' ? 'result' : 'stamping',
      deadline: null,
      frozenSecondsLeft: secondsLeft,
      answeringId: null,
      lastResult: result,
      headline: pickHeadline(result),
      results: [...s.results, result],
      score: s.score + result.breakdown.total,
      streak: result.streakAfter,
      strikes: s.strikes + (result.strike ? 1 : 0),
    })
  }

  function goTo(screen: Screen) {
    if (screen === 'game') {
      get().startGame()
      return
    }
    clearTimers()
    set({ screen })
  }

  return {
    screen: 'landing',
    ...gameReset,

    setScreen: goTo,
    nextScreen: () => {
      const i = SCREENS.indexOf(get().screen)
      goTo(SCREENS[Math.min(i + 1, SCREENS.length - 1)])
    },
    reset: () => {
      clearTimers()
      set({ ...gameReset, screen: 'landing' })
    },

    startGame: () => {
      clearTimers()
      set({ ...gameReset, screen: 'game', phase: 'entering', travellers: generateShift() })
    },

    travellerArrived: () => {
      if (get().phase !== 'entering') return
      const ms = config.timePerTravellerSec * 1000
      set({ phase: 'inspecting', deadline: Date.now() + ms })
      clearTimeout(roundTimer)
      roundTimer = setTimeout(() => finishRound('TIMEOUT', null), ms)
    },

    askQuestion: (id) => {
      const s = get()
      if (s.phase !== 'inspecting' || s.answeringId || s.askedQuestionIds.includes(id)) return
      set({ answeringId: id })
      clearTimeout(answerTimer)
      answerTimer = setTimeout(() => {
        const now = get()
        if (now.answeringId !== id) return
        set({ answeringId: null, askedQuestionIds: [...now.askedQuestionIds, id], lastAnsweredId: id })
      }, config.questionAnswerDelaySec * 1000)
    },

    openDenyPicker: () => {
      const s = get()
      if (s.phase === 'inspecting' && !s.answeringId) set({ phase: 'choosingReason' })
    },
    closeDenyPicker: () => {
      if (get().phase === 'choosingReason') set({ phase: 'inspecting' })
    },

    decide: (decision, denyReasonId = null) => {
      if (get().answeringId) return
      finishRound(decision, decision === 'DENY' ? denyReasonId : null)
    },

    stampFinished: () => {
      if (get().phase === 'stamping') set({ phase: 'result' })
    },

    nextTraveller: () => {
      const s = get()
      if (s.phase !== 'result') return
      if (selectIsLastRound(s)) {
        clearTimers()
        set({ screen: 'end', phase: 'idle' })
        return
      }
      set({ ...roundReset, index: s.index + 1, phase: 'entering' })
    },
  }
})

type Snapshot = Pick<GameState, 'travellers' | 'index' | 'strikes'>

/** The traveller currently at the counter, if any. */
export const selectTraveller = (s: Snapshot): Traveller | undefined => s.travellers[s.index]

/** True when this round ends the shift (last traveller, or fired). */
export const selectIsLastRound = (s: Snapshot): boolean => isFired(s.strikes) || s.index + 1 >= s.travellers.length
