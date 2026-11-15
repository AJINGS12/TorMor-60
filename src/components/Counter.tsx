import type { ReactNode } from 'react'

/** The officer's desk: a light wood surface the documents sit on. */
export default function Counter({ children }: { children: ReactNode }) {
  return (
    <section
      className="relative z-10 shrink-0 px-4 pt-3 pb-4 shadow-[inset_0_3px_0_rgb(255_255_255/0.55),0_-6px_20px_rgb(17_24_39/0.08)] sm:px-5"
      style={{
        background:
          'repeating-linear-gradient(90deg, rgb(120 80 30 / 0.035) 0 2px, transparent 2px 11px), linear-gradient(180deg, #ecdcc3 0%, #dfc8a6 100%)',
      }}
    >
      {children}
    </section>
  )
}
