import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { asset } from '../config/love.config'

// เทปคาสเซ็ตลอยมุมล่างขวา — audio อยู่ระดับ App (ไม่ unmount ตอนเปลี่ยน view)
export default function CassettePlayer({ tracks = [], kick = 0 }) {
  const audioRef = useRef(null)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const hasTracks = tracks && tracks.length > 0
  const current = hasTracks ? tracks[idx % tracks.length] : null

  // เริ่มเล่นจาก user gesture (ตอน PIN ถูก) — kick เปลี่ยนค่า
  useEffect(() => {
    if (kick === 0 || !hasTracks) return
    const a = audioRef.current
    if (!a) return
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [kick, hasTracks])

  const toggle = () => {
    const a = audioRef.current
    if (!a || unavailable) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    }
  }

  const next = () => {
    if (!hasTracks) return
    setIdx((i) => (i + 1) % tracks.length)
  }

  // เมื่อเปลี่ยนเพลง แล้วกำลังเล่นอยู่ → เล่นต่อ
  useEffect(() => {
    const a = audioRef.current
    if (!a || !hasTracks) return
    setUnavailable(false)
    if (playing) {
      a.play().catch(() => setPlaying(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const reel = (
    <span
      className="block rounded-full border-2 border-wine/40 bg-white/70"
      style={{
        width: 22,
        height: 22,
        boxShadow: 'inset 0 0 0 6px rgba(122,30,51,0.15)',
      }}
    />
  )

  return (
    <>
      {hasTracks && (
        <audio
          ref={audioRef}
          src={current?.src ? asset(current.src) : undefined}
          loop={tracks.length === 1}
          onEnded={next}
          onError={() => setUnavailable(true)}
        />
      )}

      <div
        className="fixed z-30"
        style={{
          right: 'calc(env(safe-area-inset-right, 0px) + 14px)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        <AnimatePresence mode="wait">
          {minimized ? (
            <motion.button
              key="mini"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              onClick={() => setMinimized(false)}
              aria-label="ขยายเครื่องเล่นเพลง"
              className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-rose to-cherry text-xl text-white shadow-pop"
            >
              🎵
            </motion.button>
          ) : (
            <motion.div
              key="full"
              initial={{ scale: 0.7, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative select-none rounded-2xl p-2.5 shadow-pop"
              style={{
                width: 150,
                background: 'linear-gradient(135deg, #7a1e33, #d62e4f)',
                border: '1px solid rgba(232,185,107,0.5)',
              }}
            >
              {/* ปุ่มย่อ */}
              <button
                onClick={() => setMinimized(true)}
                aria-label="ย่อ"
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-paper text-xs text-wine shadow"
              >
                –
              </button>

              {/* หน้าต่างเทป */}
              <div className="rounded-lg bg-paper/95 p-2">
                <div className="mb-1.5 overflow-hidden">
                  <div
                    className={
                      'whitespace-nowrap font-display text-[12px] text-wine ' +
                      (playing ? 'animate-marquee' : '')
                    }
                  >
                    {unavailable
                      ? '♪ ใส่ไฟล์เพลงใน /music'
                      : `♪ ${current?.title ?? 'ยังไม่มีเพลง'}`}
                  </div>
                </div>

                {/* ล้อเทป 2 ล้อ */}
                <div className="flex items-center justify-between px-3 py-1">
                  <span className={playing ? 'animate-spinReel' : ''}>{reel}</span>
                  <span className="mx-1 h-[3px] flex-1 rounded bg-wine/25" />
                  <span className={playing ? 'animate-spinReel' : ''}>{reel}</span>
                </div>
              </div>

              {/* ปุ่มควบคุม */}
              <div className="mt-2 flex items-center justify-center gap-3 text-paper">
                <button
                  onClick={toggle}
                  aria-label={playing ? 'หยุด' : 'เล่น'}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm active:scale-90"
                >
                  {playing ? '❚❚' : '►'}
                </button>
                {tracks.length > 1 && (
                  <button
                    onClick={next}
                    aria-label="เพลงถัดไป"
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm active:scale-90"
                  >
                    ⏭
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spinReel { to { transform: rotate(360deg); } }
        .animate-spinReel { display:inline-block; animation: spinReel 2s linear infinite; }
        @keyframes marquee { 0%{transform:translateX(12%)} 100%{transform:translateX(-60%)} }
        .animate-marquee { animation: marquee 6s linear infinite; }
      `}</style>
    </>
  )
}
