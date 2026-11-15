import { createContext, useContext } from 'react'
import type { Lang, LocalizedText } from '../engine/types'

export type TextVars = Record<string, string | number>

export interface TextApi {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Picks the current language from a `{ en, th }` object and fills `{placeholders}`. */
  t: (text: LocalizedText, vars?: TextVars) => string
  /** Formats an ISO date (YYYY-MM-DD) for the current language. */
  date: (iso: string) => string
}

/** Pure translation helper (usable outside React). */
export function translate(text: LocalizedText, lang: Lang, vars?: TextVars): string {
  const raw = text[lang] ?? text.en
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m))
}

const LOCALES: Record<Lang, string> = { en: 'en-GB', th: 'th-TH' }

export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat(LOCALES[lang], { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  )
}

export const LanguageContext = createContext<TextApi | null>(null)

export function useText(): TextApi {
  const api = useContext(LanguageContext)
  if (!api) throw new Error('useText() must be used inside <LanguageProvider>')
  return api
}
