import { useMemo } from 'react'

// หัวใจ 3D ลอย ambient (≤ 12 ดวง) — ลอยขึ้น + ตีลังกาหมุน 3 มิติ
// ปิดเองเมื่อ prefers-reduced-motion
export default function FloatingHearts({ count = 10 }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const hearts = useMemo(
    () =>
      Array.from({ length: Math.min(count, 12) }, (_, i) => ({
        left: 6 + ((i * 9.7) % 88),
        size: 12 + ((i * 7) % 18),
        delay: (i * 1.3) % 8,
        dur: 10 + ((i * 3) % 8),
        opacity: 0.14 + ((i * 5) % 10) / 70,
        blur: (i % 3) * 0.6,
        spin: 3.5 + ((i * 2.3) % 4), // ความเร็วหมุน 3D
        dir: i % 2 === 0 ? 1 : -1, // ทิศหมุน
      })),
    [count]
  )

  if (reduced) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className="absolute bottom-[-40px] animate-floatUp3d"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
          }}
        >
          <span
            className="inline-block animate-tumble3d"
            style={{
              fontSize: `${h.size}px`,
              color: 'var(--rose)',
              opacity: h.opacity,
              filter: h.blur ? `blur(${h.blur}px)` : undefined,
              animationDuration: `${h.spin}s`,
              animationDirection: h.dir === 1 ? 'normal' : 'reverse',
              textShadow: '0 2px 4px rgba(214,46,79,0.25)',
            }}
          >
            ♥
          </span>
        </span>
      ))}
      <style>{`
        @keyframes floatUp3d {
          0%   { transform: translateY(0); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(-120vh); opacity: 0; }
        }
        .animate-floatUp3d {
          animation-name: floatUp3d;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        @keyframes tumble3d {
          0%   { transform: perspective(500px) rotateX(0deg) rotateY(0deg); }
          100% { transform: perspective(500px) rotateX(360deg) rotateY(320deg); }
        }
        .animate-tumble3d {
          animation-name: tumble3d;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  )
}
