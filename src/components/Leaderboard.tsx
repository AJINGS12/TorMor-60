import { motion } from 'framer-motion'
import { rules } from '../engine/rules'
import { rankFor } from '../engine/scoring'
import { useText } from '../i18n/useText'
import { useLeaderboard } from '../store/leaderboard'

const ui = rules.ui.leaderboard
const MEDALS = ['🥇', '🥈', '🥉']

function clockTime(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

/**
 * Leaderboard table. `limit` shows only the top N (compact mode for the landing
 * preview); `highlightId` marks the player's own row.
 */
export default function Leaderboard({ limit, highlightId, compact = false }: { limit?: number; highlightId?: string | null; compact?: boolean }) {
  const { t, lang } = useText()
  const entries = useLeaderboard((s) => s.entries)
  const shown = limit ? entries.slice(0, limit) : entries

  if (shown.length === 0) {
    return <p className="py-4 text-center text-lg text-muted">{t(ui.empty)}</p>
  }

  return (
    <table className="w-full border-separate border-spacing-y-2 text-left">
      {!compact && (
        <thead className="text-sm font-semibold text-muted">
          <tr>
            <th className="w-10 px-2">#</th>
            <th className="px-2">{t(ui.officer)}</th>
            <th className="px-2 text-right">{t(ui.score)}</th>
            <th className="hidden px-2 sm:table-cell">{t(ui.rank)}</th>
            <th className="px-2 text-right">{t(ui.time)}</th>
          </tr>
        </thead>
      )}
      <tbody>
        {shown.map((e, i) => {
          const mine = e.id === highlightId
          return (
            <motion.tr
              key={e.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={mine ? 'bg-brand-50 outline-2 outline-brand' : 'bg-canvas'}
            >
              <td className="w-12 rounded-l-xl px-3 py-2.5 text-xl font-extrabold">{MEDALS[i] ?? i + 1}</td>
              <td className="max-w-[10rem] truncate px-2 py-2.5 text-left text-lg font-semibold text-ink">
                {e.nickname}
                {mine && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">{t(ui.you)}</span>}
              </td>
              <td className={`px-3 py-2.5 text-right text-xl font-extrabold text-ink tabular-nums ${compact ? 'rounded-r-xl' : ''}`}>{e.score}</td>
              {!compact && (
                <>
                  <td className="hidden px-2 py-2.5 text-sm text-muted sm:table-cell">{t(rankFor(e.score))}</td>
                  <td className="rounded-r-xl px-3 py-2.5 text-right text-sm text-muted tabular-nums">{clockTime(e.playedAt, lang)}</td>
                </>
              )}
            </motion.tr>
          )
        })}
      </tbody>
    </table>
  )
}
