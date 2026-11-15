import { create } from 'zustand'
import { config } from '../engine/rules'

export interface LeaderboardEntry {
  id: string
  nickname: string
  score: number
  /** ISO timestamp of when the shift ended. */
  playedAt: string
}

const STORAGE_KEY = 'tormor60.leaderboard.v1'

function isEntry(x: unknown): x is LeaderboardEntry {
  const e = x as LeaderboardEntry
  return !!e && typeof e.id === 'string' && typeof e.nickname === 'string' && typeof e.score === 'number' && typeof e.playedAt === 'string'
}

/** Highest score first; ties go to whoever got there first. */
function rankEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt)).slice(0, config.leaderboardSize)
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? rankEntries(parsed.filter(isEntry)) : []
  } catch {
    return []
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage full or blocked (private mode): the leaderboard just won't persist.
  }
}

interface LeaderboardState {
  entries: LeaderboardEntry[]
  /** Adds a score and returns its id (whether or not it made the top list). */
  add: (nickname: string, score: number) => string
  clear: () => void
}

export const useLeaderboard = create<LeaderboardState>()((set, get) => ({
  entries: loadLeaderboard(),
  add: (nickname, score) => {
    const entry: LeaderboardEntry = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      nickname,
      score,
      playedAt: new Date().toISOString(),
    }
    const entries = rankEntries([...get().entries, entry])
    saveLeaderboard(entries)
    set({ entries })
    return entry.id
  },
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    set({ entries: [] })
  },
}))
