// Sound effects generated with the Web Audio API — no audio files, works offline.

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  // Browsers start the context suspended until a user gesture; players have tapped by now.
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A short blip at `frequency` Hz. */
function blip(frequency: number, durationSec: number, volume: number) {
  const ac = audio()
  if (!ac) return
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec)
  osc.connect(gain).connect(ac.destination)
  osc.start(now)
  osc.stop(now + durationSec + 0.02)
}

/** Countdown tick. `urgent` = the last few seconds: higher pitch, a little louder. */
export function playTick(urgent: boolean) {
  if (urgent) blip(1568, 0.09, 0.35)
  else blip(988, 0.06, 0.22)
}
