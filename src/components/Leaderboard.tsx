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
    return <p className="py-4 text-center text-base text-slate-400">{t(ui.empty)}</p>
  }

  return (
    <table className="w-full border-separate border-spacing-y-1.5 text-left">
      {!compact && (
        <thead className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
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
              className={mine ? 'bg-neon-pink/20 ring-2 ring-neon-pink glow-pink' : 'bg-night-800/70'}
            >
              <td className="w-12 rounded-l-lg px-2 py-2 text-lg font-extrabold">{MEDALS[i] ?? i + 1}</td>
              <td className="max-w-[10rem] truncate px-2 py-2 text-left text-lg font-semibold">
                {e.nickname}
                {mine && <span className="ml-2 rounded-full bg-neon-pink px-2 py-0.5 text-xs font-bold text-night-950">{t(ui.you)}</span>}
              </td>
              <td className={`px-2 py-2 text-right text-lg font-extrabold text-neon-amber tabular-nums ${compact ? 'rounded-r-lg' : ''}`}>{e.score}</td>
              {!compact && (
                <>
                  <td className="hidden px-2 py-2 text-sm text-slate-300 sm:table-cell">{t(rankFor(e.score))}</td>
                  <td className="rounded-r-lg px-2 py-2 text-right text-sm text-slate-400 tabular-nums">{clockTime(e.playedAt, lang)}</td>
                </>
              )}
            </motion.tr>
          )
        })}
      </tbody>
    </table>
  )
}
