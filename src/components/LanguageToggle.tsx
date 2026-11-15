import { useText } from '../i18n/useText'
import type { Lang } from '../engine/types'

const LANGS: Lang[] = ['en', 'th']

export default function LanguageToggle() {
  const { lang, setLang } = useText()
  return (
    <div className="flex h-12 overflow-hidden rounded-full border border-cyan-400/40 bg-night-900/80 text-sm font-semibold">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-w-12 px-3 uppercase transition-colors ${
            lang === l ? 'bg-cyan-400 text-night-950' : 'text-cyan-200 hover:bg-cyan-400/10'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
