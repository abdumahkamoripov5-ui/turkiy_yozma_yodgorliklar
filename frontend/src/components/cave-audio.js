// An original, quiet pentatonic score. Audio starts only from a user gesture.
export function createCaveAudio(volume) {
  const Audio = window.AudioContext || window.webkitAudioContext
  if (!Audio) throw new Error('Audio is unavailable')
  const context = new Audio()
  const master = context.createGain()
  master.gain.value = volume * .22
  master.connect(context.destination)
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1400
  filter.connect(master)
  const echo = context.createDelay(1)
  echo.delayTime.value = .42
  const feedback = context.createGain()
  feedback.gain.value = .25
  filter.connect(echo)
  echo.connect(feedback)
  feedback.connect(echo)
  echo.connect(master)
  const notes = [220, 293.665, 349.228, 329.628, 293.665, 220, 196, 220, 261.626, 293.665, 220, 196]
  let next = 0, index = 0, timer = 0, disposed = false
  const playNote = (frequency, time) => {
    const tone = context.createOscillator()
    const envelope = context.createGain()
    tone.type = 'sine'
    tone.frequency.value = frequency
    envelope.gain.setValueAtTime(0, time)
    envelope.gain.linearRampToValueAtTime(.15, time + .3)
    envelope.gain.exponentialRampToValueAtTime(.001, time + 3.7)
    envelope.gain.linearRampToValueAtTime(0, time + 4)
    tone.connect(envelope)
    envelope.connect(filter)
    tone.start(time)
    tone.stop(time + 4)
    tone.onended = () => { tone.disconnect(); envelope.disconnect() }
  }
  const schedule = () => {
    if (disposed || context.state !== 'running') return
    while (next < context.currentTime + .7) {
      playNote(notes[index % notes.length], next)
      if (index % 4 === 0) playNote(110, next)
      next += index % 4 === 3 ? 3.6 : 1.8
      index++
    }
  }
  return {
    async play() {
      if (disposed) return
      await context.resume()
      if (disposed) return
      next = context.currentTime + .08
      clearInterval(timer)
      schedule()
      timer = setInterval(schedule, 350)
    },
    async pause() { clearInterval(timer); if (!disposed) await context.suspend() },
    setVolume(value) { if (!disposed) master.gain.setTargetAtTime(value * .22, context.currentTime, .1) },
    stop() {
      disposed = true
      clearInterval(timer)
      if (context.state !== 'closed') void context.close().catch(() => {})
    },
  }
}
