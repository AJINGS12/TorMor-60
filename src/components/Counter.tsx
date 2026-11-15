import type { ReactNode } from 'react'

/** The officer's desk at the bottom of the booth. */
export default function Counter({ children }: { children: ReactNode }) {
  return (
    <section className="relative z-10 shrink-0">
      {/* Counter top edge with a neon strip */}
      <div className="h-3 bg-gradient-to-b from-desk-700 to-desk-800 shadow-[0_-2px_24px_rgb(255_63_164/0.35)]">
        <div className="h-0.5 bg-neon-pink/80 shadow-[0_0_12px_rgb(255_63_164/0.9)]" />
      </div>
      <div className="bg-[linear-gradient(180deg,var(--color-desk-800),#140f22)] px-3 pt-3 pb-4 sm:px-5">{children}</div>
    </section>
  )
}
