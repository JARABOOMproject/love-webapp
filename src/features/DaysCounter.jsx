import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG } from '../config/love.config'
import {
  daysSince,
  yearsAndDays,
  todayBangkok,
  TH_MONTHS,
  TH_DOW,
} from '../lib/date'
import FeatureShell from '../components/FeatureShell'

// count-up hook
function useCountUp(target, duration = 1500) {
  const [val, setVal] = useState(0)
  const raf = useRef()
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setVal(target)
      return
    }
    let start
    const step = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return val
}

export default function DaysCounter({ onBack }) {
  const total = daysSince(CONFIG.anniversaryDate)
  const shown = useCountUp(total)
  const bd = yearsAndDays(CONFIG.anniversaryDate)
  const [showCal, setShowCal] = useState(false)

  return (
    <FeatureShell onBack={onBack} title="เราอยู่และรู้จักกัน" subtitle="ทุกวันคือของขวัญเรา 💗">
      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!showCal ? (
            <motion.div
              key="count"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -30 }}
              className="paper-texture relative w-full rounded-card bg-white/80 px-6 py-10 text-center shadow-card"
              style={{ border: '1px solid rgba(247,108,138,0.25)' }}
            >
              <span className="washi" aria-hidden />
              <p className="text-wine/70">รู้ไหมเรารู้จักกัน</p>
              <div className="my-2 font-display text-[64px] leading-none text-cherry">
                {shown.toLocaleString('th-TH')}
              </div>
              <p className="text-lg text-wine">วัน 💗</p>
              <p className="mt-4 text-sm text-wine/60">
                = {bd.years} ปี {bd.days} วัน
              </p>

              <button onClick={() => setShowCal(true)} className="btn-love mt-8">
                ดูปฏิทิน →
              </button>
            </motion.div>
          ) : (
            <Calendar key="cal" onClose={() => setShowCal(false)} />
          )}
        </AnimatePresence>
      </div>
    </FeatureShell>
  )
}

function Calendar({ onClose }) {
  const t = todayBangkok()
  const anni = CONFIG.anniversaryDate.split('-').map(Number) // [y,m,d]
  const [cursor, setCursor] = useState({ y: t.y, m: t.m }) // m: 1-12
  const [dir, setDir] = useState(0)
  const [firstOpen, setFirstOpen] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => setFirstOpen(false), 2200)
    return () => clearTimeout(id)
  }, [])

  const grid = useMemo(() => {
    const firstDow = new Date(cursor.y, cursor.m - 1, 1).getDay() // 0=Sun
    const daysInMonth = new Date(cursor.y, cursor.m, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [cursor])

  const move = (delta) => {
    setDir(delta)
    setCursor((c) => {
      let m = c.m + delta
      let y = c.y
      if (m < 1) {
        m = 12
        y -= 1
      }
      if (m > 12) {
        m = 1
        y += 1
      }
      return { y, m }
    })
  }

  const isToday = (d) => d === t.day && cursor.m === t.m && cursor.y === t.y
  const isAnni = (d) => d === anni[2] && cursor.m === anni[1] // ครบรอบทุกเดือน (วันเดียวกัน)

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="paper-texture relative w-full overflow-hidden rounded-card bg-white/85 px-4 py-5 shadow-card"
      style={{ border: '1px solid rgba(247,108,138,0.25)' }}
    >
      {/* heart shower ครั้งแรก */}
      {firstOpen && <HeartShower />}

      <div className="mb-3 flex items-center justify-between px-1">
        <button
          onClick={() => move(-1)}
          className="grid h-9 w-9 place-items-center rounded-full text-wine active:bg-blush/60"
          aria-label="เดือนก่อน"
        >
          ←
        </button>
        <div className="font-display text-lg text-wine">
          {TH_MONTHS[cursor.m - 1]} {cursor.y + 543}
        </div>
        <button
          onClick={() => move(1)}
          className="grid h-9 w-9 place-items-center rounded-full text-wine active:bg-blush/60"
          aria-label="เดือนถัดไป"
        >
          →
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs text-wine/50">
        {TH_DOW.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={`${cursor.y}-${cursor.m}`}
          custom={dir}
          initial={{ opacity: 0, x: dir >= 0 ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir >= 0 ? -40 : 40 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-7 gap-y-1 text-center"
        >
          {grid.map((d, i) => (
            <div key={i} className="flex h-10 items-center justify-center">
              {d && (
                <div className="relative grid h-9 w-9 place-items-center">
                  {isAnni(d) ? (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-[20px] text-cherry"
                    >
                      ♥
                    </motion.span>
                  ) : (
                    <span
                      className={
                        'grid h-8 w-8 place-items-center rounded-full text-sm ' +
                        (isToday(d)
                          ? 'bg-rose font-semibold text-white'
                          : 'text-wine/70')
                      }
                    >
                      {d}
                    </span>
                  )}
                  {isAnni(d) && (
                    <span className="absolute -bottom-0.5 text-[9px] text-cherry/80">
                      {d}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <button onClick={onClose} className="btn-love mt-5 w-full">
        ← กลับไปนับวัน
      </button>
    </motion.div>
  )
}

function HeartShower() {
  const drops = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 7.3) % 100,
    delay: (i % 7) * 0.12,
    size: 12 + (i % 4) * 4,
  }))
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {drops.map((d, i) => (
        <motion.span
          key={i}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 420, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, delay: d.delay, ease: 'easeIn' }}
          className="absolute text-cherry"
          style={{ left: `${d.left}%`, fontSize: d.size }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  )
}
