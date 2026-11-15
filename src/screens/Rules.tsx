import { motion } from 'framer-motion'
import LanguageToggle from '../components/LanguageToggle'
import NightAirport from '../components/NightAirport'
import RulesDemo from '../components/RulesDemo'
import { rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

const ui = rules.ui.rules

export default function Rules() {
  const { t } = useText()
  const startGame = useGameStore((s) => s.startGame)
  const nickname = useGameStore((s) => s.nickname)

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-night-950">
      <NightAirport />
      <header className="relative z-10 flex items-center justify-between gap-4 p-4">
        <h1 className="text-3xl font-extrabold text-neon-amber sm:text-4xl">
          📋 {t(ui.title)}
          {nickname && <span className="ml-3 text-xl text-white/80">· {nickname}</span>}
        </h1>
        <LanguageToggle />
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 gap-5 px-4 pb-28 lg:grid-cols-[1.1fr_1fr]">
        <section className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2.5">
            {ui.points.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex gap-3 rounded-xl bg-night-900/80 p-3 text-lg leading-snug ring-1 ring-white/10"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-neon-cyan font-extrabold text-night-950">{i + 1}</span>
                <span>{t(p)}</span>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <RulesDemo />
          <div className="rounded-2xl bg-night-900/80 p-4 ring-1 ring-neon-amber/40">
            <h2 className="mb-2 text-lg font-extrabold text-neon-amber">📘 {t(rules.ui.game.rulebook)}</h2>
            <ul className="grid gap-1.5">
              {ui.checklist.map((item, i) => (
                <li key={i} className="flex gap-2 text-base leading-snug">
                  <span className="text-neon-cyan">✔</span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Start button pinned to the bottom so it is always reachable */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-night-950 via-night-950/90 to-transparent px-4 pt-8 pb-5">
        <motion.button
          onClick={startGame}
          whileTap={{ scale: 0.96 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="mx-auto block min-h-16 w-full max-w-md rounded-2xl bg-neon-green text-2xl font-extrabold text-night-950 glow-green"
        >
          🛂 {t(ui.start)}
        </motion.button>
      </div>
    </div>
  )
}
