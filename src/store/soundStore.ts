import { create } from 'zustand'

const KEY = 'tormor60.muted'

function loadMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

interface SoundState {
  muted: boolean
  toggleMute: () => void
}

/** Mute setting, remembered between sessions on this device. */
export const useSoundStore = create<SoundState>()((set, get) => ({
  muted: loadMuted(),
  toggleMute: () => {
    const muted = !get().muted
    try {
      localStorage.setItem(KEY, muted ? '1' : '0')
    } catch {
      // ignore: the setting just won't persist
    }
    set({ muted })
  },
}))

/** Plays a sound effect unless the player has muted the game. */
export function playSfx(play: () => void): void {
  if (!useSoundStore.getState().muted) play()
}
