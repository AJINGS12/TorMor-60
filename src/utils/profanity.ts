// Quick nickname filter for a public booth. Deliberately small: it catches the
// obvious stuff, not every creative spelling.

/** Blocked anywhere in the name (long or unambiguous enough not to hit normal words). */
const SUBSTRINGS = [
  // English
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'pussy', 'asshole', 'bastard', 'whore', 'slut',
  'nigger', 'nigga', 'faggot', 'retard', 'porn', 'rape', 'nazi', 'hitler', 'wank', 'twat',
  // Thai
  'เหี้ย', 'สัส', 'ควย', 'เย็ด', 'แตด', 'ดอกทอง', 'กะหรี่', 'ส้นตีน', 'ระยำ', 'ชาติหมา', 'จัญไร', 'เงี่ยน',
]

/** Blocked only as a whole word (short, would otherwise hit innocent names). */
const WORDS = ['ass', 'cock', 'cum', 'tit', 'tits', 'fag', 'sex', 'hoe', 'หี', 'สัด', 'มึง']

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's', '!': 'i' }

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[013457@$!]/g, (c) => LEET[c] ?? c)
}

export function isNicknameBlocked(name: string): boolean {
  const n = normalize(name)
  // Squash separators so "f.u.c.k" or "f u c k" still match the substring list.
  const squashed = n.replace(/[^\p{L}\p{M}]/gu, '')
  if (SUBSTRINGS.some((w) => squashed.includes(w))) return true
  const words = n.split(/[^\p{L}\p{M}]+/u).filter(Boolean)
  return words.some((w) => WORDS.includes(w))
}

/** Trims and collapses whitespace. */
export function cleanNickname(name: string): string {
  return name.replace(/\s+/g, ' ').trim()
}
