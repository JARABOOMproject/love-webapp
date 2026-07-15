import { useMemo } from 'react'

// หัวใจลอย ambient เบา ๆ (≤ 12 ดวง) — ปิดเองเมื่อ prefers-reduced-motion
export default function FloatingHearts({ count = 10 }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const hearts = useMemo(
    () =>
      Array.from({ length: Math.min(count, 12) }, (_, i) => ({
        left: 6 + ((i * 9.7) % 88),
        size: 10 + ((i * 7) % 16),
        delay: (i * 1.3) % 8,
        dur: 9 + ((i * 3) % 7),
        opacity: 0.12 + ((i * 5) % 10) / 60,
      })),
    [count]
  )

  if (reduced) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className="absolute bottom-[-30px] animate-floatUp"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            color: 'var(--rose)',
            opacity: h.opacity,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
          }}
        >
          ♥
        </span>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(.8) rotate(0deg); opacity: 0; }
          12%  { opacity: 1; }
          100% { transform: translateY(-115vh) scale(1.1) rotate(24deg); opacity: 0; }
        }
        .animate-floatUp { animation-name: floatUp; animation-timing-function: ease-in; animation-iteration-count: infinite; }
      `}</style>
    </div>
  )
}
