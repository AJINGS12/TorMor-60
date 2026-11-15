import { useText } from '../i18n/useText'
import type { Lang } from '../engine/types'

const LANGS: Lang[] = ['en', 'th']

export default function LanguageToggle() {
  const { lang, setLang } = useText()
  return (
    <div className="flex h-12 rounded-full bg-canvas p-1 text-sm font-semibold">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-w-12 rounded-full px-3 uppercase transition ${lang === l ? 'bg-white text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
