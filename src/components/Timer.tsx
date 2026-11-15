import { config, rules } from '../engine/rules'
import { useSecondsLeft } from '../hooks/useSecondsLeft'
import { useText } from '../i18n/useText'

const TOTAL = config.timePerTravellerSec

export default function Timer() {
  const { t } = useText()
  const secondsLeft = useSecondsLeft()
  const warning = secondsLeft <= config.timerWarningSec
  const fraction = secondsLeft / TOTAL

  return (
    <div className="flex min-w-36 flex-1 items-center gap-3" role="timer" aria-live="off">
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-line">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-colors duration-300 ${warning ? 'bg-deny' : 'bg-brand'}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <span className={`w-16 text-right text-2xl font-extrabold tabular-nums ${warning ? 'text-deny' : 'text-ink'}`}>
        {t(rules.ui.game.seconds, { seconds: Math.ceil(secondsLeft) })}
      </span>
    </div>
  )
}
