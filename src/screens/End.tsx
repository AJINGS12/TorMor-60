import { animate, motion, useAnimate } from 'framer-motion'
import { useEffect, useState } from 'react'
import Flag from '../components/Flag'
import Leaderboard from '../components/Leaderboard'
import LanguageToggle from '../components/LanguageToggle'
import { InkSplash } from '../components/Stamp'
import { rules } from '../engine/rules'
import { isFired, rankFor } from '../engine/scoring'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'

const ui = rules.ui.end
const VERDICT_ICON = { correct: '✅', wrong: '❌', timeout: '⏰' } as const
const STAMP_DELAY = 0.3
const COUNT_DELAY_MS = 900

/** Counts up from 0 to `value` once the stamp has landed. */
function useCountUp(value: number): number {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    let controls: ReturnType<typeof animate> | undefined
    const timer = setTimeout(() => {
      controls = animate(0, value, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    }, COUNT_DELAY_MS)
    return () => {
      clearTimeout(timer)
      controls?.stop()
    }
  }, [value])
  return shown
}

function BigStamp({ fired, onImpact }: { fired: boolean; onImpact: () => void }) {
  const { t } = useText()
  // Red only for FIRED (strikes); a completed shift uses the brand colour.
  const color = fired ? '#dc2626' : '#2563eb'
  return (
    <motion.div
      className="relative"
      initial={{ scale: 3.5, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: -8, opacity: 1 }}
      transition={{ delay: STAMP_DELAY, duration: 0.22, ease: [0.6, 0, 1, 1] }}
      onAnimationComplete={onImpact}
    >
      <div
        className="rounded-2xl border-[6px] bg-white/60 px-6 py-2 text-5xl font-extrabold tracking-widest whitespace-nowrap uppercase sm:text-7xl"
        style={{ color, borderColor: color }}
      >
        {t(fired ? ui.fired : ui.complete)}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: STAMP_DELAY + 0.22, duration: 0 }}>
        <InkSplash color={color} />
      </motion.div>
    </motion.div>
  )
}

export default function End() {
  const { t } = useText()
  const score = useGameStore((s) => s.score)
  const strikes = useGameStore((s) => s.strikes)
  const results = useGameStore((s) => s.results)
  const travellers = useGameStore((s) => s.travellers)
  const nickname = useGameStore((s) => s.nickname)
  const lastEntryId = useGameStore((s) => s.lastEntryId)
  const startGame = useGameStore((s) => s.startGame)
  const [scope, shake] = useAnimate()

  const fired = isFired(strikes)
  const shownScore = useCountUp(score)
  const rank = rankFor(score)

  return (
    <div ref={scope} className="relative min-h-dvh overflow-x-clip bg-[linear-gradient(180deg,#eef3ff_0%,#f7f8fa_35%)]">
      <header className="relative z-10 flex justify-end p-5">
        <LanguageToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-7 px-5 pb-12">
        <BigStamp
          fired={fired}
          onImpact={() => shake(scope.current, { x: [0, -16, 13, -9, 6, 0], y: [0, 8, -6, 4, 0] }, { duration: 0.45 })}
        />

        {/* Score + rank */}
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <div className="text-lg font-semibold text-muted">
            {nickname && <span className="text-ink">{nickname} · </span>}
            {t(ui.yourScore)}
          </div>
          <div className="text-8xl leading-none font-extrabold text-ink tabular-nums sm:text-9xl">
            {shownScore}
          </div>
          <motion.div
            className="mt-4 inline-block rounded-full bg-brand-50 px-6 py-2 text-2xl font-bold text-brand"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.6, type: 'spring' }}
          >
            🎖️ {t(ui.yourRank)}: {t(rank)}
          </motion.div>
        </motion.div>

        <div className="grid w-full gap-5 lg:grid-cols-2">
          {/* Per-traveller summary */}
          <section className="rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="mb-3 text-xl font-extrabold text-ink">🧳 {t(ui.summary)}</h2>
            <ul className="flex flex-col gap-2">
              {results.map((r, i) => {
                const traveller = travellers.find((tr) => tr.id === r.travellerId)
                return (
                  <motion.li
                    key={r.travellerId}
                    className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.15 }}
                  >
                    <span className="text-2xl">{VERDICT_ICON[r.outcome]}</span>
                    {traveller && <Flag code={traveller.country.code} className="h-5" />}
                    <span className="min-w-0 flex-1 truncate text-lg font-semibold text-ink">{traveller?.name}</span>
                    {traveller && <span className="hidden text-sm text-muted sm:inline">{t(rules.personas[traveller.purpose])}</span>}
                    <span className="w-16 text-right text-lg font-extrabold text-ink tabular-nums">+{r.breakdown.total}</span>
                  </motion.li>
                )
              })}
            </ul>
          </section>

          {/* Leaderboard */}
          <section className="rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="mb-1 text-xl font-extrabold text-ink">🏆 {t(ui.leaderboard)}</h2>
            <Leaderboard highlightId={lastEntryId} />
          </section>
        </div>

        {/* Nitify call to action */}
        <motion.p
          className="max-w-2xl rounded-2xl bg-brand-50 p-5 text-center text-lg font-semibold text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          💡 {t(ui.nitifyCta)}
        </motion.p>

        <motion.button
          onClick={startGame}
          whileTap={{ scale: 0.95 }}
          className="min-h-16 w-full max-w-md animate-hint rounded-2xl bg-brand text-2xl font-bold text-white shadow-soft hover:bg-brand-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          🔁 {t(ui.playAgain)}
        </motion.button>

        <p className="max-w-2xl text-center text-sm leading-relaxed text-muted">{t(rules.meta.disclaimer)}</p>
      </main>
    </div>
  )
}
