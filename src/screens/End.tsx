import { useGameStore } from '../store/gameStore'

export default function End() {
  const reset = useGameStore((s) => s.reset)

  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-4xl font-bold">Shift over</h1>
      <p className="text-slate-400">Placeholder — End screen</p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-300"
      >
        Play again
      </button>
    </section>
  )
}
