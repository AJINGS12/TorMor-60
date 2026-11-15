import { useMemo } from 'react'
import type { PurposeId } from '../engine/types'
import { createRng, pick } from '../utils/random'

const SKIN = ['#f6d5b8', '#ecc19c', '#d9a07a', '#b97c55', '#8d5a3b', '#5e3a24']
const HAIR = ['#1b1b1b', '#3b2416', '#6b4423', '#a8743a', '#d9b26f', '#9a9a9a']
const SHIRT = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']
type HairStyle = 'short' | 'long' | 'bun' | 'curly'
const HAIR_STYLES: HairStyle[] = ['short', 'long', 'bun', 'curly']

function Hair({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case 'short':
      return <path d="M68 70 Q70 38 100 36 Q130 38 132 70 Q120 54 100 54 Q80 54 68 70Z" fill={color} />
    case 'long':
      return (
        <path d="M64 74 Q64 34 100 34 Q136 34 136 74 L138 128 Q128 120 126 92 Q118 56 100 56 Q82 56 74 92 Q72 120 62 128Z" fill={color} />
      )
    case 'bun':
      return (
        <g fill={color}>
          <circle cx="100" cy="30" r="13" />
          <path d="M68 70 Q70 40 100 40 Q130 40 132 70 Q118 56 100 56 Q82 56 68 70Z" />
        </g>
      )
    case 'curly':
      return (
        <g fill={color}>
          {[70, 84, 100, 116, 130].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 44 : 52} r="13" />
          ))}
        </g>
      )
  }
}

function Luggage({ purpose }: { purpose: PurposeId }) {
  if (purpose === 'study') {
    // Backpack straps + books in hand
    return (
      <g>
        <path d="M76 128 L70 196" stroke="#374151" strokeWidth="7" strokeLinecap="round" />
        <path d="M124 128 L130 196" stroke="#374151" strokeWidth="7" strokeLinecap="round" />
        <rect x="140" y="178" width="30" height="38" rx="3" fill="#fbbf24" transform="rotate(-8 155 197)" />
        <rect x="143" y="182" width="24" height="5" fill="#b45309" transform="rotate(-8 155 197)" />
      </g>
    )
  }
  if (purpose === 'work') {
    // Tie + briefcase
    return (
      <g>
        <path d="M100 128 L94 140 L100 182 L106 140Z" fill="#1e3a8a" />
        <rect x="146" y="214" width="46" height="34" rx="4" fill="#5b3a1e" stroke="#2b1a0b" strokeWidth="2" />
        <path d="M160 214 V206 H178 V214" fill="none" stroke="#2b1a0b" strokeWidth="4" />
      </g>
    )
  }
  // Tourist: rolling suitcase with stickers + sunglasses
  return (
    <g>
      <path d="M182 150 V198" stroke="#9ca3af" strokeWidth="4" />
      <rect x="160" y="196" width="46" height="66" rx="8" fill="#6366f1" stroke="#4338ca" strokeWidth="2" />
      <circle cx="174" cy="216" r="6" fill="#fbbf24" />
      <rect x="184" y="230" width="14" height="10" rx="2" fill="#e0e7ff" />
      <circle cx="168" cy="266" r="4" fill="#111" />
      <circle cx="198" cy="266" r="4" fill="#111" />
      <g fill="#111">
        <rect x="80" y="76" width="16" height="9" rx="4" />
        <rect x="104" y="76" width="16" height="9" rx="4" />
        <rect x="95" y="78" width="10" height="2" />
      </g>
    </g>
  )
}

/** Simple procedural traveller avatar. Appearance is random per traveller, independent of nationality. */
export default function Avatar({ seed, purpose, className }: { seed: number; purpose: PurposeId; className?: string }) {
  const look = useMemo(() => {
    const rng = createRng(seed)
    return { skin: pick(rng, SKIN), hair: pick(rng, HAIR), shirt: pick(rng, SHIRT), style: pick(rng, HAIR_STYLES) }
  }, [seed])

  return (
    <svg viewBox="0 0 220 280" className={className} aria-hidden>
      {/* Body */}
      <path d="M52 280 Q52 140 100 128 Q148 140 148 280Z" fill={look.shirt} opacity="0.9" />
      <path d="M86 128 L100 146 L114 128" fill="none" stroke="#111827" strokeOpacity="0.3" strokeWidth="3" />
      {/* Neck + head */}
      <rect x="90" y="104" width="20" height="26" rx="6" fill={look.skin} />
      {look.style === 'long' && <Hair style="long" color={look.hair} />}
      <ellipse cx="100" cy="76" rx="32" ry="38" fill={look.skin} />
      {look.style !== 'long' && <Hair style={look.style} color={look.hair} />}
      {look.style === 'long' && <path d="M70 66 Q80 48 100 48 Q120 48 130 66 Q116 58 100 58 Q84 58 70 66Z" fill={look.hair} />}
      {/* Face */}
      <circle cx="88" cy="80" r="3.5" fill="#1b1b1b" />
      <circle cx="112" cy="80" r="3.5" fill="#1b1b1b" />
      <path d="M90 96 Q100 103 110 96" fill="none" stroke="#1b1b1b" strokeWidth="2.5" strokeLinecap="round" />
      <Luggage purpose={purpose} />
    </svg>
  )
}
