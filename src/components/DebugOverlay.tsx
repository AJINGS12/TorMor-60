// TEMPORARY playtest helper. Visible only with ?debug=1 in the URL.
import { getRequirements } from '../engine/requirements'
import { selectTraveller, useGameStore } from '../store/gameStore'

import { DEBUG } from '../utils/debug'

export default function DebugOverlay() {
  const traveller = useGameStore(selectTraveller)
  if (!DEBUG || !traveller) return null
  const req = getRequirements(traveller)

  return (
    <div className="pointer-events-none fixed bottom-2 left-2 z-50 max-w-xs rounded-lg bg-black/85 p-3 font-mono text-[11px] leading-relaxed text-lime-300 ring-1 ring-lime-400/50">
      <div className="font-bold text-lime-200">DEBUG · {traveller.id}</div>
      <div>
        {traveller.country.code} · {traveller.purpose} · {traveller.stayDays}d · {traveller.route.type}
        {traveller.route.transit ? ` via ${traveller.route.transit.code}` : ''}
      </div>
      <div className={traveller.flaw ? 'text-pink-300' : ''}>
        flaw: {traveller.flaw ? `${traveller.flaw.id} → ${traveller.flaw.denyReason}` : 'none (APPROVE)'}
      </div>
      <div>required: {req.requiredDocuments.join(', ')}</div>
      <div>questions: {req.necessaryQuestionIds.join(', ')}</div>
    </div>
  )
}
