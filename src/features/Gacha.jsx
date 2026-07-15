import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG } from '../config/love.config'
import { heartConfetti } from '../lib/confetti'
import FeatureShell from '../components/FeatureShell'
import Popup from '../components/Popup'

const USED_KEY = 'love_gacha_used'

function readUsed() {
  try {
    return JSON.parse(sessionStorage.getItem(USED_KEY) || '[]')
  } catch {
    return []
  }
}
function writeUsed(arr) {
  try {
    sessionStorage.setItem(USED_KEY, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

// สุ่มไม่ซ้ำจนกว่าจะครบ แล้วรีเซ็ต
function pickNext() {
  const all = CONFIG.gacha
  let used = readUsed()
  if (used.length >= all.length) used = []
  const pool = all.map((_, i) => i).filter((i) => !used.includes(i))
  const idx = pool[Math.floor(Math.random() * pool.length)] ?? 0
  writeUsed([...used, idx])
  return { idx, text: all[idx] }
}

export default function Gacha({ onBack }) {
  // phase: idle → twisting → dropped → opening → done
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [showCard, setShowCard] = useState(false)
  const busy = useRef(false)

  const capsuleColor = ['#f76c8a', '#d62e4f', '#e8b96b']

  const twist = () => {
    if (busy.current || phase === 'dropped') return
    busy.current = true
    setResult(pickNext())
    setPhase('twisting')
    // จังหวะ 1: บิด/สั่น → 2: หล่น
    setTimeout(() => setPhase('dropped'), 700)
    setTimeout(() => {
      busy.current = false
    }, 700)
  }

  const openCapsule = () => {
    if (phase !== 'dropped') return
    setPhase('opening')
    // จังหวะ 3: แตก
    setTimeout(() => {
      setShowCard(true)
      heartConfetti()
      setPhase('done')
    }, 450)
  }

  const again = () => {
    setShowCard(false)
    setResult(null)
    setPhase('idle')
  }

  const cur = result?.idx ?? 0
  const capColor = capsuleColor[cur % 3]

  return (
    <FeatureShell onBack={onBack} title="ตู้กาชาของเรา" subtitle="บิดดูสิ มีคำจากใจซ่อนอยู่">
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* ── ตัวตู้กาชา ── */}
        <motion.div
          animate={phase === 'twisting' ? { rotate: [0, -2, 2, -2, 1, 0] } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
          style={{ width: 200 }}
        >
          {/* โดมแก้ว */}
          <div
            className="relative mx-auto h-40 w-40 overflow-hidden rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 28%, rgba(255,255,255,0.85), rgba(255,217,227,0.5) 55%, rgba(247,108,138,0.25))',
              border: '3px solid rgba(255,255,255,0.7)',
              boxShadow: 'inset 0 6px 16px rgba(255,255,255,0.6), 0 10px 24px rgba(214,46,79,0.2)',
            }}
          >
            {/* แคปซูลกองอยู่ */}
            {[
              { l: 22, t: 78, c: 0 },
              { l: 52, t: 88, c: 1 },
              { l: 82, t: 74, c: 2 },
              { l: 40, t: 58, c: 2 },
              { l: 70, t: 60, c: 0 },
              { l: 30, t: 96, c: 1 },
            ].map((c, i) => (
              <Capsule key={i} left={c.l} top={c.t} color={capsuleColor[c.c]} />
            ))}
          </div>

          {/* ตัวตู้ */}
          <div
            className="mx-auto -mt-3 h-32 w-44 rounded-2xl"
            style={{
              background: 'linear-gradient(160deg, #e8455f, #d62e4f 60%, #a51f38)',
              boxShadow: '0 12px 26px rgba(214,46,79,0.35)',
            }}
          >
            {/* หมุนบิด */}
            <div className="flex flex-col items-center pt-4">
              <motion.button
                onClick={twist}
                whileTap={{ rotate: 160, scale: 0.94 }}
                animate={phase === 'twisting' ? { rotate: 180 } : { rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                aria-label="บิดกาชา"
                className="grid h-14 w-14 place-items-center rounded-full text-2xl text-cherry shadow-lg"
                style={{
                  background: 'radial-gradient(circle at 40% 35%, #fff, #ffd9e3)',
                  border: '3px solid var(--gold)',
                }}
              >
                <span style={{ transform: 'rotate(0deg)' }}>✚</span>
              </motion.button>

              {/* ช่องรับแคปซูล */}
              <div
                className="mt-3 h-9 w-24 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.4)' }}
              >
                <AnimatePresence>
                  {(phase === 'dropped' || phase === 'opening') && (
                    <motion.button
                      onClick={openCapsule}
                      initial={{ y: -70, scale: 0.6, opacity: 0 }}
                      animate={
                        phase === 'opening'
                          ? { y: 0, scale: [1, 1.3, 0], rotate: [0, 20, -20] }
                          : { y: 4, scale: 1, opacity: 1 }
                      }
                      transition={
                        phase === 'opening'
                          ? { duration: 0.45 }
                          : { type: 'spring', stiffness: 300, damping: 12, bounce: 0.6 }
                      }
                      aria-label="เปิดแคปซูล"
                      className="mx-auto block"
                    >
                      <StandaloneCapsule color={capColor} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* คำใบ้จังหวะ */}
        <p className="mt-6 h-6 text-sm text-wine/60">
          {phase === 'idle' && 'แตะปุ่มกลางเพื่อบิดกาชา 🎰'}
          {phase === 'twisting' && 'กำลังบิด…'}
          {phase === 'dropped' && 'แตะแคปซูลเพื่อเปิด! 👆'}
          {phase === 'done' && ' '}
        </p>

        {phase === 'done' && (
          <button onClick={again} className="btn-love mt-2">
            สุ่มอีกครั้ง 🎰
          </button>
        )}
      </div>

      {/* การ์ดข้อความ */}
      <Popup open={showCard} onClose={again}>
        <div className="pt-2 text-center">
          <div className="mb-3 text-4xl">💝</div>
          <p className="font-hand text-2xl leading-relaxed text-wine">
            {result?.text}
          </p>
          <button onClick={again} className="btn-love mt-6">
            สุ่มอีกครั้ง 🎰
          </button>
        </div>
      </Popup>
    </FeatureShell>
  )
}

function Capsule({ left, top, color }) {
  return (
    <div
      className="absolute h-6 w-6 rounded-full"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: 'translate(-50%,-50%)',
        background: `linear-gradient(180deg, ${color} 50%, #fff 50%)`,
        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.6)',
      }}
    />
  )
}

function StandaloneCapsule({ color }) {
  return (
    <div
      className="h-8 w-8 rounded-full"
      style={{
        background: `linear-gradient(180deg, ${color} 50%, #fff 50%)`,
        boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.7)',
      }}
    />
  )
}
