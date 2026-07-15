import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG, asset } from '../config/love.config'
import { heartConfetti } from '../lib/confetti'
import { placeholderDataUrl } from '../lib/placeholder'
import FeatureShell from '../components/FeatureShell'
import Popup from '../components/Popup'

const BOARD = 320

function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // อย่าให้เริ่มต้นแก้แล้ว
  if (a.every((v, i) => v === i)) return shuffled(n)
  return a
}

export default function Jigsaw({ onBack }) {
  const { rows, cols, image, message } = CONFIG.jigsaw
  const n = rows * cols
  const [board, setBoard] = useState(() => shuffled(n))
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState(false)
  const [flash, setFlash] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [imgSrc, setImgSrc] = useState(asset(image))

  // ตรวจว่ารูปโหลดได้ไหม ถ้าไม่ได้ใช้ placeholder
  useEffect(() => {
    const img = new Image()
    img.onerror = () => setImgSrc(placeholderDataUrl('รูปของเรา', 640, 640, 0))
    img.src = asset(image)
  }, [image])

  const solvedCount = useMemo(
    () => board.filter((v, i) => v === i).length,
    [board]
  )

  const tapPiece = (pos) => {
    if (done) return
    if (board[pos] === pos) return // ล็อกแล้ว
    if (selected === null) {
      setSelected(pos)
      return
    }
    if (selected === pos) {
      setSelected(null)
      return
    }
    // สลับ
    const next = board.slice()
    ;[next[pos], next[selected]] = [next[selected], next[pos]]
    setSelected(null)
    setBoard(next)
    if (next.every((v, i) => v === i)) {
      setDone(true)
      setFlash(true)
      heartConfetti()
      setTimeout(() => setFlash(false), 600)
      setTimeout(() => setShowPopup(true), 800)
    }
  }

  const cellW = BOARD / cols
  const cellH = BOARD / rows

  return (
    <FeatureShell onBack={onBack} title="จิ๊กซอว์ของเรา" subtitle="แตะสองชิ้นเพื่อสลับที่">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="paper-texture relative rounded-card bg-white p-3 shadow-card"
          style={{ border: '1px solid rgba(247,108,138,0.25)' }}
        >
          <span className="washi" aria-hidden />
          <div
            className="relative overflow-hidden rounded-xl"
            style={{ width: BOARD, height: BOARD, touchAction: 'manipulation' }}
          >
            {board.map((piece, pos) => {
              const pr = Math.floor(piece / cols)
              const pc = piece % cols
              const locked = piece === pos
              const isSel = selected === pos
              const row = Math.floor(pos / cols)
              const col = pos % cols
              return (
                <motion.button
                  key={pos}
                  onClick={() => tapPiece(pos)}
                  animate={{
                    scale: isSel ? 0.92 : 1,
                  }}
                  className="absolute overflow-hidden"
                  style={{
                    width: cellW,
                    height: cellH,
                    left: col * cellW,
                    top: row * cellH,
                    backgroundImage: `url(${imgSrc})`,
                    backgroundSize: `${BOARD}px ${BOARD}px`,
                    backgroundPosition: `-${pc * cellW}px -${pr * cellH}px`,
                    outline: locked
                      ? '2px solid var(--gold)'
                      : isSel
                        ? '3px solid var(--cherry)'
                        : '1px solid rgba(255,255,255,0.6)',
                    outlineOffset: '-2px',
                    boxShadow: locked
                      ? '0 0 10px rgba(232,185,107,0.7) inset'
                      : 'none',
                    zIndex: isSel ? 5 : 1,
                  }}
                />
              )
            })}

            {/* flash ตอนเสร็จ */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: flash ? 0.85 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-wine/60">
          {done ? 'ต่อครบแล้ว! 🎉' : `${solvedCount}/${n} ชิ้น`}
        </p>
      </div>

      <Popup open={showPopup} onClose={() => setShowPopup(false)}>
        <div className="text-center">
          <div className="polaroid mx-auto mb-4 w-[230px]">
            <img
              src={imgSrc}
              alt="ภาพที่ต่อเสร็จ"
              className="h-[210px] w-full rounded object-cover"
            />
            <p className="mt-2 pb-1 font-hand text-lg text-wine">{message}</p>
          </div>
        </div>
      </Popup>
    </FeatureShell>
  )
}
