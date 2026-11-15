import { useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../engine/types'
import { formatDate, LanguageContext, translate, type TextApi } from './useText'

export function LanguageProvider({ children, initialLang = 'th' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  const api = useMemo<TextApi>(
    () => ({
      lang,
      setLang,
      t: (text, vars) => translate(text, lang, vars),
      date: (iso) => formatDate(iso, lang),
    }),
    [lang],
  )

  return <LanguageContext.Provider value={api}>{children}</LanguageContext.Provider>
}
