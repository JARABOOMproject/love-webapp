import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG, asset } from '../config/love.config'
import { heartConfetti } from '../lib/confetti'
import { loadImageWithFallback, placeholderDataUrl } from '../lib/placeholder'
import FeatureShell from '../components/FeatureShell'
import Popup from '../components/Popup'

const SIZE = 320
const THRESHOLD = 0.65

export default function ScratchCard({ onBack }) {
  const baseRef = useRef(null) // รูปจริงข้างล่าง
  const coverRef = useRef(null) // เลเยอร์ขูด
  const [revealed, setRevealed] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [pct, setPct] = useState(0)

  const drawing = useRef(false)
  const lastPt = useRef(null)
  const rafPending = useRef(false)
  const revealedRef = useRef(false)

  // วาดรูปจริง + เลเยอร์ปก
  useEffect(() => {
    let alive = true
    const base = baseRef.current
    const cover = coverRef.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ;[base, cover].forEach((c) => {
      c.width = SIZE * dpr
      c.height = SIZE * dpr
      const ctx = c.getContext('2d')
      ctx.scale(dpr, dpr)
    })

    // รูปจริง
    loadImageWithFallback(asset(CONFIG.scratch.image), 'รูปของเรา', 1, 640).then((img) => {
      if (!alive) return
      const ctx = base.getContext('2d')
      drawCover(ctx, img, SIZE, SIZE)
    })

    // เลเยอร์ขูด: gradient ชมพู–ทอง + ข้อความ
    const ctx = cover.getContext('2d')
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    g.addColorStop(0, '#f76c8a')
    g.addColorStop(0.5, '#ffd9e3')
    g.addColorStop(1, '#e8b96b')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    // ลายจุด
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    for (let y = 12; y < SIZE; y += 22)
      for (let x = 12; x < SIZE; x += 22) {
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    ctx.fillStyle = 'rgba(122,30,51,0.85)'
    ctx.font = '600 22px Mitr, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('ขูดตรงนี้เลย ✨', SIZE / 2, SIZE / 2)
    ctx.font = '400 14px "IBM Plex Sans Thai", sans-serif'
    ctx.fillText('ลากนิ้วไปมา~', SIZE / 2, SIZE / 2 + 26)

    return () => {
      alive = false
    }
  }, [])

  const pointerPos = (e) => {
    const rect = coverRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    }
  }

  const scratchLine = (from, to) => {
    const ctx = coverRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 40
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(to.x, to.y, 20, 0, Math.PI * 2)
    ctx.fill()
  }

  const scheduleSample = () => {
    if (rafPending.current || revealedRef.current) return
    rafPending.current = true
    requestAnimationFrame(() => {
      rafPending.current = false
      const p = sampleCleared(coverRef.current)
      setPct(p)
      if (p >= THRESHOLD && !revealedRef.current) doReveal()
    })
  }

  const start = (e) => {
    if (revealedRef.current) return
    drawing.current = true
    lastPt.current = pointerPos(e)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const move = (e) => {
    if (!drawing.current || revealedRef.current) return
    const p = pointerPos(e)
    scratchLine(lastPt.current || p, p)
    lastPt.current = p
    scheduleSample()
  }
  const end = () => {
    drawing.current = false
    lastPt.current = null
  }

  const doReveal = () => {
    revealedRef.current = true
    setRevealed(true)
    heartConfetti()
    setTimeout(() => setShowPopup(true), 700)
  }

  return (
    <FeatureShell onBack={onBack} title="ขูดหัวใจ" subtitle="ขูดไปเรื่อย ๆ เดี๋ยวมีเซอร์ไพรส์">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="paper-texture relative bg-white p-3 pb-4"
          style={{
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--hairline-gold)',
            boxShadow: 'var(--shadow-3), inset 0 0 0 2px rgba(232,185,107,0.3)',
          }}
        >
          <span className="washi" aria-hidden />
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              width: SIZE,
              height: SIZE,
              touchAction: 'none',
              boxShadow: 'inset 0 2px 10px rgba(122,30,51,0.12)',
            }}
          >
            <canvas
              ref={baseRef}
              className="absolute inset-0 h-full w-full"
              style={{ width: SIZE, height: SIZE }}
            />
            <motion.canvas
              ref={coverRef}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              animate={{ opacity: revealed ? 0 : 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 h-full w-full"
              style={{ width: SIZE, height: SIZE, touchAction: 'none', cursor: 'grab' }}
            />
          </div>
        </div>

        {/* progress */}
        <div
          className="mt-6 h-2.5 w-60 overflow-hidden rounded-full"
          style={{ background: 'rgba(255,217,227,0.7)', boxShadow: 'inset 0 1px 2px rgba(122,30,51,0.12)' }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose to-cherry"
            style={{ boxShadow: '0 0 8px rgba(214,46,79,0.4)' }}
            animate={{ width: `${Math.min(100, Math.round((pct / THRESHOLD) * 100))}%` }}
          />
        </div>
        <p className="mt-2.5 text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>
          {revealed ? 'เผยแล้ว 💗' : `ขูดไปแล้ว ${Math.round(pct * 100)}%`}
        </p>
      </div>

      <Popup open={showPopup} onClose={() => setShowPopup(false)}>
        <div className="text-center">
          <div className="polaroid mx-auto mb-4 w-[220px]">
            <img
              src={asset(CONFIG.scratch.image)}
              alt=""
              className="h-[200px] w-full rounded object-cover"
              onError={(e) => {
                if (e.currentTarget.dataset.fb) return
                e.currentTarget.dataset.fb = '1'
                e.currentTarget.src = placeholderDataUrl('รูปของเรา', 440, 400, 1)
              }}
            />
          </div>
          <p className="font-hand text-xl text-wine">{CONFIG.scratch.message}</p>
        </div>
      </Popup>
    </FeatureShell>
  )
}

// วาดรูปแบบ cover (เต็มกรอบไม่บิด)
function drawCover(ctx, img, w, h) {
  const ir = img.width / img.height
  const cr = w / h
  let sw, sh, sx, sy
  if (ir > cr) {
    sh = img.height
    sw = sh * cr
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / cr
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
}

// วัด % พื้นที่โปร่งใส (ขูดแล้ว) — sample เว้นระยะเพื่อความเร็ว
function sampleCleared(canvas) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const step = 16
  const data = ctx.getImageData(0, 0, width, height).data
  let cleared = 0
  let total = 0
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const a = data[(y * width + x) * 4 + 3]
      total++
      if (a < 40) cleared++
    }
  }
  return total ? cleared / total : 0
}
