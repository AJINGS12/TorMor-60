import { useGameStore } from '../store/gameStore'

export default function Landing() {
  const nextScreen = useGameStore((s) => s.nextScreen)

  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-4xl font-bold">Tor Mor 60</h1>
      <p className="text-slate-400">Placeholder — Landing screen</p>
      <button
        onClick={() => nextScreen()}
        className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-300"
      >
        Start
      </button>
    </section>
  )
}
