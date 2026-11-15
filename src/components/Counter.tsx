import type { ReactNode } from 'react'

/** The officer's desk at the bottom of the booth. */
export default function Counter({ children }: { children: ReactNode }) {
  return (
    <section className="relative z-10 shrink-0 rounded-t-3xl bg-white px-4 pt-4 pb-5 shadow-[0_-8px_30px_rgb(17_24_39/0.07)] sm:px-6">
      {children}
    </section>
  )
}
