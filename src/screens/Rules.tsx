import { motion } from 'framer-motion'
import LanguageToggle from '../components/LanguageToggle'
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
    <div className="relative flex min-h-dvh flex-col bg-[linear-gradient(180deg,#eef3ff_0%,#f7f8fa_40%)]">
      <header className="relative z-10 flex items-center justify-between gap-4 p-5">
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
          📋 {t(ui.title)}
          {nickname && <span className="ml-3 text-2xl font-semibold text-brand">· {nickname}</span>}
        </h1>
        <LanguageToggle />
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 gap-6 px-5 pb-32 lg:grid-cols-[1.1fr_1fr]">
        <section className="flex flex-col gap-4">
          <ol className="flex flex-col gap-3">
            {ui.points.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-4 rounded-2xl bg-white p-4 text-xl leading-snug text-ink shadow-soft"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 font-extrabold text-brand">{i + 1}</span>
                <span>{t(p)}</span>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <RulesDemo />
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="mb-3 text-xl font-extrabold text-ink">📘 {t(rules.ui.game.rulebook)}</h2>
            <ul className="grid gap-2">
              {ui.checklist.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-lg leading-snug text-ink">
                  <span className="font-bold text-brand">✓</span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Start button pinned to the bottom so it is always reachable */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-4 pt-10 pb-6">
        <motion.button
          onClick={startGame}
          whileTap={{ scale: 0.96 }}
          className="mx-auto block min-h-16 w-full max-w-md animate-hint rounded-2xl bg-brand text-2xl font-bold text-white shadow-soft hover:bg-brand-600"
        >
          🛂 {t(ui.start)}
        </motion.button>
      </div>
    </div>
  )
}
