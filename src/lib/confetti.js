import confetti from 'canvas-confetti'

const reduced = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// หัวใจ confetti — วาด path หัวใจเป็น shape
let heartShape = null
function getHeart() {
  if (heartShape) return heartShape
  try {
    heartShape = confetti.shapeFromPath({
      path: 'M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z',
    })
  } catch {
    heartShape = null
  }
  return heartShape
}

const COLORS = ['#f76c8a', '#d62e4f', '#ffd9e3', '#e8b96b', '#ff9bb3']

export function heartConfetti(opts = {}) {
  if (reduced()) return
  const heart = getHeart()
  const base = {
    particleCount: 42,
    spread: 70,
    startVelocity: 42,
    scalar: 1.15,
    ticks: 220,
    colors: COLORS,
    origin: { y: 0.6 },
    ...(heart ? { shapes: [heart] } : {}),
    ...opts,
  }
  confetti(base)
}

export function heartBurst() {
  if (reduced()) return
  const heart = getHeart()
  const shots = [
    { particleCount: 30, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } },
    { particleCount: 30, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } },
    { particleCount: 40, angle: 90, spread: 80, origin: { x: 0.5, y: 0.55 } },
  ]
  shots.forEach((s, i) =>
    setTimeout(
      () =>
        confetti({
          ...s,
          colors: COLORS,
          scalar: 1.1,
          startVelocity: 45,
          ...(heart ? { shapes: [heart] } : {}),
        }),
      i * 120
    )
  )
}
