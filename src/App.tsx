import { AnimatePresence, motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { useGameStore, type Screen } from './store/gameStore'
import Landing from './screens/Landing'
import Nickname from './screens/Nickname'
import Rules from './screens/Rules'
import Game from './screens/Game'
import End from './screens/End'

const screens: Record<Screen, ComponentType> = {
  landing: Landing,
  nickname: Nickname,
  rules: Rules,
  game: Game,
  end: End,
}

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const Current = screens[screen]

  return (
    <main className="flex min-h-full items-center justify-center bg-slate-900 p-6 text-slate-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl"
        >
          <Current />
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
