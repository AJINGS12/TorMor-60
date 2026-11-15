// Simplified, bundled SVG flags (emoji flags render as letters on Windows).
// All drawn on a 30×20 canvas; emblems are reduced to simple shapes.
import type { ReactNode } from 'react'

function starPoints(cx: number, cy: number, r: number, inner = 0.4, points = 5, rotation = -90): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const rad = ((rotation + (i * 180) / points) * Math.PI) / 180
    const radius = i % 2 === 0 ? r : r * inner
    return `${(cx + radius * Math.cos(rad)).toFixed(2)},${(cy + radius * Math.sin(rad)).toFixed(2)}`
  }).join(' ')
}

const Star = ({ cx, cy, r, fill = '#fff', inner, points, rotation }: { cx: number; cy: number; r: number; fill?: string; inner?: number; points?: number; rotation?: number }) => (
  <polygon points={starPoints(cx, cy, r, inner, points, rotation)} fill={fill} />
)

function UnionJack({ w = 30, h = 20 }: { w?: number; h?: number }) {
  return (
    <g>
      <rect width={w} height={h} fill="#012169" />
      <path d={`M0 0L${w} ${h}M${w} 0L0 ${h}`} stroke="#fff" strokeWidth={h * 0.2} />
      <path d={`M0 0L${w} ${h}M${w} 0L0 ${h}`} stroke="#C8102E" strokeWidth={h * 0.07} />
      <path d={`M${w / 2} 0V${h}M0 ${h / 2}H${w}`} stroke="#fff" strokeWidth={h * 0.33} />
      <path d={`M${w / 2} 0V${h}M0 ${h / 2}H${w}`} stroke="#C8102E" strokeWidth={h * 0.2} />
    </g>
  )
}

const FLAGS: Record<string, ReactNode> = {
  US: (
    <>
      <rect width="30" height="20" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * (40 / 13)} width="30" height={20 / 13} fill="#B22234" />
      ))}
      <rect width="12" height={(20 / 13) * 7} fill="#3C3B6E" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={1.6 + (i % 4) * 2.9} cy={1.6 + Math.floor(i / 4) * 3.4} r="0.6" fill="#fff" />
      ))}
    </>
  ),
  GB: <UnionJack />,
  AU: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <svg width="15" height="10" viewBox="0 0 30 20">
        <UnionJack />
      </svg>
      <Star cx={7.5} cy={15} r={2.6} points={7} inner={0.45} />
      <Star cx={22.5} cy={4} r={1.1} points={7} inner={0.45} />
      <Star cx={19} cy={9} r={1.1} points={7} inner={0.45} />
      <Star cx={26} cy={8} r={1.1} points={7} inner={0.45} />
      <Star cx={22.5} cy={16.5} r={1.1} points={7} inner={0.45} />
    </>
  ),
  QA: (
    <>
      <rect width="30" height="20" fill="#8A1538" />
      <polygon
        fill="#fff"
        points={['0,0', ...Array.from({ length: 9 }, (_, i) => `8,${(i * 20) / 9} 11,${((i + 0.5) * 20) / 9}`), '8,20', '0,20'].join(' ')}
      />
    </>
  ),
  NG: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#008751" />
      <rect x="20" width="10" height="20" fill="#008751" />
    </>
  ),
  IN: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.67" fill="#FF9933" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.6" />
      <circle cx="15" cy="10" r="0.6" fill="#000080" />
    </>
  ),
  JP: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <circle cx="15" cy="10" r="6" fill="#BC002D" />
    </>
  ),
  CN: (
    <>
      <rect width="30" height="20" fill="#DE2910" />
      <Star cx={5} cy={5} r={3} fill="#FFDE00" />
      <Star cx={10} cy={2} r={1} fill="#FFDE00" rotation={-60} />
      <Star cx={12} cy={4} r={1} fill="#FFDE00" rotation={-75} />
      <Star cx={12} cy={7} r={1} fill="#FFDE00" rotation={-95} />
      <Star cx={10} cy={9} r={1} fill="#FFDE00" rotation={-110} />
    </>
  ),
  CA: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="7.5" height="20" fill="#D52B1E" />
      <rect x="22.5" width="7.5" height="20" fill="#D52B1E" />
      <path
        fill="#D52B1E"
        d="M15 3.2l1.1 2.1 1.3-.5-.5 3.1 1.8-1.9.4 1.1 2-.4-.7 2.2.9.4-3 2.4.4 1.3-2.9-.4.1 3h-.8l.1-3-2.9.4.4-1.3-3-2.4.9-.4-.7-2.2 2 .4.4-1.1 1.8 1.9-.5-3.1 1.3.5z"
      />
    </>
  ),
  SG: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="10" fill="#EF3340" />
      <circle cx="6.5" cy="5" r="3.3" fill="#fff" />
      <circle cx="7.9" cy="5" r="3.1" fill="#EF3340" />
      {[0, 72, 144, 216, 288].map((a) => (
        <Star key={a} cx={10 + 1.6 * Math.cos(((a - 90) * Math.PI) / 180)} cy={5 + 1.6 * Math.sin(((a - 90) * Math.PI) / 180)} r={0.55} />
      ))}
    </>
  ),
  BR: (
    <>
      <rect width="30" height="20" fill="#009C3B" />
      <polygon points="15,2 28,10 15,18 2,10" fill="#FFDF00" />
      <circle cx="15" cy="10" r="4.6" fill="#002776" />
      <path d="M10.6 9.2 Q15 8 19.5 10.8" stroke="#fff" strokeWidth="0.8" fill="none" />
    </>
  ),
  KE: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6" fill="#000" />
      <rect y="7" width="30" height="6" fill="#BB0000" />
      <rect y="14" width="30" height="6" fill="#006600" />
      <ellipse cx="15" cy="10" rx="2.6" ry="5.5" fill="#BB0000" stroke="#fff" strokeWidth="0.4" />
      <ellipse cx="15" cy="10" rx="1.1" ry="5.3" fill="#000" />
    </>
  ),
  ET: (
    <>
      <rect width="30" height="6.67" fill="#078930" />
      <rect y="6.67" width="30" height="6.67" fill="#FCDD09" />
      <rect y="13.33" width="30" height="6.67" fill="#DA121A" />
      <circle cx="15" cy="10" r="4.4" fill="#0F47AF" />
      <polygon points={starPoints(15, 10.3, 3)} fill="none" stroke="#FCDD09" strokeWidth="0.5" />
    </>
  ),
  AE: (
    <>
      <rect width="30" height="6.67" fill="#00732F" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#000" />
      <rect width="7.5" height="20" fill="#FF0000" />
    </>
  ),
}

/** Country flag by ISO code. Falls back to the code in a box. */
export default function Flag({ code, className = 'h-5' }: { code: string; className?: string }) {
  const art = FLAGS[code]
  if (!art) {
    return <span className={`inline-grid aspect-[3/2] place-items-center rounded-sm bg-line text-[9px] font-bold text-muted ${className}`}>{code}</span>
  }
  return (
    <svg viewBox="0 0 30 20" className={`inline-block aspect-[3/2] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgb(17_24_39/0.12)] ${className}`} role="img" aria-label={code}>
      {art}
    </svg>
  )
}
