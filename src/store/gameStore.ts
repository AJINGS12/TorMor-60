import { create } from 'zustand'

export const SCREENS = ['landing', 'nickname', 'rules', 'game', 'end'] as const
export type Screen = (typeof SCREENS)[number]

interface GameState {
  screen: Screen
  setScreen: (screen: Screen) => void
  /** Advance to the next screen in the Landing → Nickname → Rules → Game → End flow. */
  nextScreen: () => void
  /** Return to the Landing screen. */
  reset: () => void
}

export const useGameStore = create<GameState>()((set) => ({
  screen: 'landing',
  setScreen: (screen) => set({ screen }),
  nextScreen: () =>
    set((s) => {
      const i = SCREENS.indexOf(s.screen)
      return { screen: SCREENS[Math.min(i + 1, SCREENS.length - 1)] }
    }),
  reset: () => set({ screen: 'landing' }),
}))
