import { AnimatePresence, motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import LanguageToggle from '../components/LanguageToggle'
import NightAirport from '../components/NightAirport'
import { rules } from '../engine/rules'
import { useText } from '../i18n/useText'
import { useGameStore } from '../store/gameStore'
import { cleanNickname, isNicknameBlocked } from '../utils/profanity'

const ui = rules.ui.nickname

export default function Nickname() {
  const { t } = useText()
  const saved = useGameStore((s) => s.nickname)
  const setNickname = useGameStore((s) => s.setNickname)
  const nextScreen = useGameStore((s) => s.nextScreen)
  const [value, setValue] = useState(saved)
  const [blocked, setBlocked] = useState(false)

  const name = cleanNickname(value)
  const canContinue = name.length > 0

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!canContinue) return
    if (isNicknameBlocked(name)) {
      setBlocked(true)
      return
    }
    setNickname(name)
    nextScreen()
  }

  return (
    // Content sits in the top half so an on-screen keyboard never covers the input or button.
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-night-950">
      <NightAirport />
      <header className="relative z-10 flex justify-end p-4">
        <LanguageToggle />
      </header>

      <form onSubmit={submit} className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-[6vh]">
        <h1 className="text-center text-3xl font-extrabold text-white text-glow-cyan sm:text-4xl">{t(ui.title)}</h1>

        <label htmlFor="nickname" className="text-sm font-semibold tracking-wider text-neon-cyan uppercase">
          {t(ui.label)}
        </label>
        <div className="relative">
          <input
            id="nickname"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setBlocked(false)
            }}
            maxLength={ui.maxLength}
            placeholder={t(ui.placeholder)}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-invalid={blocked}
            aria-describedby="nickname-help"
            className={`h-18 w-full rounded-2xl bg-night-900/90 px-5 pr-20 text-3xl font-semibold text-white ring-2 outline-none placeholder:text-slate-500 focus:ring-4 ${
              blocked ? 'ring-neon-red focus:ring-neon-red/60' : 'ring-neon-cyan/60 focus:ring-neon-cyan/60'
            }`}
          />
          <span className="absolute top-1/2 right-5 -translate-y-1/2 text-sm text-slate-400 tabular-nums">
            {value.length}/{ui.maxLength}
          </span>
        </div>

        <div id="nickname-help" className="min-h-6 text-sm" aria-live="polite">
          <AnimatePresence mode="wait">
            {blocked ? (
              <motion.p key="blocked" className="font-semibold text-neon-red" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}>
                {t(ui.blocked)}
              </motion.p>
            ) : (
              <motion.p key="hint" className="text-slate-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ⏎ {t(ui.hint)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={!canContinue}
          whileTap={canContinue ? { scale: 0.96 } : undefined}
          className="min-h-16 rounded-2xl bg-neon-pink text-2xl font-extrabold text-white glow-pink transition-opacity disabled:opacity-35"
        >
          {t(ui.continue)} →
        </motion.button>
      </form>
    </div>
  )
}
