import { AnimatePresence, motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import LanguageToggle from '../components/LanguageToggle'
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
    <div className="relative flex min-h-dvh flex-col bg-[linear-gradient(180deg,#e8edf7_0%,#f7f8fa_45%)]">
      <header className="relative z-10 flex justify-end p-5">
        <LanguageToggle />
      </header>

      <form onSubmit={submit} className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-[6vh]">
        <h1 className="text-center text-4xl font-extrabold text-ink sm:text-5xl">{t(ui.title)}</h1>

        <label htmlFor="nickname" className="mt-4 text-base font-semibold text-muted">
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
            className={`h-20 w-full rounded-2xl bg-white px-6 pr-20 text-3xl font-semibold text-ink shadow-soft outline-none placeholder:text-line focus:ring-4 ${
              blocked ? 'ring-2 ring-deny focus:ring-deny/25' : 'focus:ring-brand/25'
            }`}
          />
          <span className="absolute top-1/2 right-6 -translate-y-1/2 text-base text-muted tabular-nums">
            {value.length}/{ui.maxLength}
          </span>
        </div>

        <div id="nickname-help" className="min-h-6 text-sm" aria-live="polite">
          <AnimatePresence mode="wait">
            {blocked ? (
              <motion.p key="blocked" className="text-base font-semibold text-deny" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}>
                {t(ui.blocked)}
              </motion.p>
            ) : (
              <motion.p key="hint" className="text-base text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ⏎ {t(ui.hint)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={!canContinue}
          whileTap={canContinue ? { scale: 0.96 } : undefined}
          className={`min-h-16 rounded-2xl bg-brand text-2xl font-bold text-white shadow-soft transition-opacity hover:bg-brand-600 disabled:opacity-35 ${canContinue && !blocked ? 'animate-hint' : ''}`}
        >
          {t(ui.continue)} →
        </motion.button>
      </form>
    </div>
  )
}
