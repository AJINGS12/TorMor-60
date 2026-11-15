import { AnimatePresence, motion } from 'framer-motion'
import type { ComponentType } from 'react'
import IdleReset from './components/IdleReset'
import { LanguageProvider } from './i18n/LanguageContext'
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
    <LanguageProvider>
      <IdleReset />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-full"
        >
          <Current />
        </motion.div>
      </AnimatePresence>
    </LanguageProvider>
  )
}
