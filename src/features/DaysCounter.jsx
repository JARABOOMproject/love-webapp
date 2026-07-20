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
              className="card-love w-full px-6 py-11 text-center"
            >
              <span className="washi" aria-hidden />
              <p style={{ color: 'var(--ink-soft)' }}>รู้ไหมเรารู้จักกัน</p>
              <div
                className="my-1 font-display text-[68px] leading-none text-cherry"
                style={{
                  background: 'linear-gradient(180deg, #f76c8a, #d62e4f)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 4px 10px rgba(214,46,79,0.22))',
                }}
              >
                {shown.toLocaleString('th-TH')}
              </div>
              <p className="text-lg text-wine">วัน 💗</p>
              <div
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-wine"
                style={{
                  background: 'linear-gradient(180deg, #fffdf8, #fff3e6)',
                  border: '1px dashed var(--gold-deep)',
                  boxShadow: 'var(--shadow-gold)',
                }}
              >
                <span className="text-gold">✦</span>
                = {bd.years} ปี {bd.days} วัน
                <span className="text-gold">✦</span>
              </div>

              <div className="mt-8">
                <button onClick={() => setShowCal(true)} className="btn-love">
                  ดูปฏิทิน →
                </button>
              </div>
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
      className="card-love w-full overflow-hidden px-4 py-5"
    >
      {/* heart shower ครั้งแรก */}
      {firstOpen && <HeartShower />}

      <div className="mb-3 flex items-center justify-between px-1">
        <button
          onClick={() => move(-1)}
          className="glass grid h-11 w-11 place-items-center rounded-full text-lg text-wine transition active:brightness-95"
          style={{ border: '1px solid rgba(232,185,107,0.5)' }}
          aria-label="เดือนก่อน"
        >
          ←
        </button>
        <div className="foil-text font-display text-lg">
          {TH_MONTHS[cursor.m - 1]} {cursor.y + 543}
        </div>
        <button
          onClick={() => move(1)}
          className="glass grid h-11 w-11 place-items-center rounded-full text-lg text-wine transition active:brightness-95"
          style={{ border: '1px solid rgba(232,185,107,0.5)' }}
          aria-label="เดือนถัดไป"
        >
          →
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs" style={{ color: 'var(--ink-faint)' }}>
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
                        (isToday(d) ? 'font-semibold text-white' : '')
                      }
                      style={
                        isToday(d)
                          ? {
                              background: 'linear-gradient(135deg, var(--rose), var(--cherry))',
                              boxShadow: '0 4px 10px rgba(214,46,79,0.35)',
                            }
                          : { color: 'var(--ink-soft)' }
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
