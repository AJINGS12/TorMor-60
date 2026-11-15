// Sound effects generated with the Web Audio API — no audio files, works offline.
// Callers decide whether to play (mute lives in store/soundStore).

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  // Browsers start the context suspended until a user gesture; players have tapped by now.
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface Tone {
  type: OscillatorType
  /** Start frequency (Hz). */
  from: number
  /** Optional end frequency for a pitch sweep. */
  to?: number
  /** Seconds after "now" to start. */
  at?: number
  duration: number
  volume: number
  /** Optional low-pass cutoff (Hz) to soften harsh waveforms. */
  lowpass?: number
}

/** One oscillator with a fast attack and exponential decay. */
function tone(ac: AudioContext, { type, from, to, at = 0, duration, volume, lowpass }: Tone) {
  const start = ac.currentTime + at
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, start)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  let node: AudioNode = osc
  if (lowpass) {
    const filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(lowpass, start)
    node = osc.connect(filter)
  }
  node.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.03)
}

/** Short burst of filtered noise: the "slap" of rubber on paper. */
function noiseHit(ac: AudioContext, duration: number, volume: number, cutoff: number) {
  const start = ac.currentTime
  const length = Math.ceil(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, length, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(cutoff, start)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(volume, start)
  src.connect(filter).connect(gain).connect(ac.destination)
  src.start(start)
}

/** Countdown tick. `urgent` = the last few seconds: higher pitch, a little louder. */
export function playTick(urgent: boolean) {
  const ac = audio()
  if (!ac) return
  if (urgent) tone(ac, { type: 'triangle', from: 1568, duration: 0.09, volume: 0.35 })
  else tone(ac, { type: 'triangle', from: 988, duration: 0.06, volume: 0.22 })
}

/** Stamp landing: short, low, punchy thunk (pitch-dropping body + a soft slap). */
export function playThunk() {
  const ac = audio()
  if (!ac) return
  tone(ac, { type: 'sine', from: 150, to: 45, duration: 0.18, volume: 0.9 })
  tone(ac, { type: 'triangle', from: 90, to: 40, duration: 0.12, volume: 0.4 })
  noiseHit(ac, 0.05, 0.5, 1200)
}

/** Correct decision: bright rising chime (C6 → E6 → G6). */
export function playCorrect() {
  const ac = audio()
  if (!ac) return
  ;[1047, 1319, 1568].forEach((f, i) => tone(ac, { type: 'sine', from: f, at: i * 0.09, duration: 0.45, volume: 0.25 }))
}

/** Wrong decision or timeout: low, short double buzz. */
export function playWrong() {
  const ac = audio()
  if (!ac) return
  for (const at of [0, 0.17]) {
    tone(ac, { type: 'sawtooth', from: 140, at, duration: 0.14, volume: 0.22, lowpass: 900 })
    tone(ac, { type: 'sawtooth', from: 147, at, duration: 0.14, volume: 0.18, lowpass: 900 })
  }
}
