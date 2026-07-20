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
  const [peek, setPeek] = useState(false)
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
    <FeatureShell
      onBack={onBack}
      title="จิ๊กซอว์ของเรา"
      subtitle="แตะ 2 ชิ้นเพื่อสลับที่ · กดค้าง 👁 เพื่อดูภาพเต็ม"
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="paper-texture relative bg-white p-3"
          style={{
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--hairline-gold)',
            boxShadow: 'var(--shadow-3), inset 0 0 0 2px rgba(232,185,107,0.3)',
          }}
        >
          <span className="washi" aria-hidden />
          <div
            className="relative overflow-hidden rounded-xl bg-blush/30"
            style={{
              width: BOARD,
              height: BOARD,
              touchAction: 'manipulation',
              boxShadow: 'inset 0 2px 10px rgba(122,30,51,0.12)',
            }}
          >
            {/* ghost preview จาง ๆ ช่วยให้ต่อง่ายขึ้น */}
            <img
              src={imgSrc}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.16]"
            />

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
                  animate={{ scale: isSel ? 1.06 : 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="absolute overflow-hidden"
                  style={{
                    width: cellW - 2,
                    height: cellH - 2,
                    left: col * cellW + 1,
                    top: row * cellH + 1,
                    borderRadius: 7,
                    backgroundImage: `url(${imgSrc})`,
                    backgroundSize: `${BOARD}px ${BOARD}px`,
                    backgroundPosition: `-${pc * cellW}px -${pr * cellH}px`,
                    outline: locked
                      ? '2.5px solid var(--gold)'
                      : isSel
                        ? '3px solid var(--cherry)'
                        : '1px solid rgba(255,255,255,0.65)',
                    outlineOffset: '-2px',
                    boxShadow: locked
                      ? '0 0 10px rgba(232,185,107,0.7) inset'
                      : isSel
                        ? '0 8px 18px rgba(214,46,79,0.35)'
                        : '0 1px 3px rgba(0,0,0,0.12)',
                    zIndex: isSel ? 10 : 1,
                  }}
                />
              )
            })}

            {/* peek: กดค้างเพื่อดูภาพเต็ม */}
            <motion.img
              src={imgSrc}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full rounded-xl object-cover"
              initial={false}
              animate={{ opacity: peek ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ zIndex: 15 }}
            />

            {/* flash ตอนเสร็จ */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: flash ? 0.85 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ zIndex: 20 }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <p
            className="rounded-full px-3.5 py-1.5 text-sm font-medium"
            style={{ background: 'rgba(255,217,227,0.55)', color: 'var(--ink)' }}
          >
            {done ? 'ต่อครบแล้ว! 🎉' : `${solvedCount}/${n} ชิ้น`}
          </p>
          {!done && (
            <button
              onPointerDown={() => setPeek(true)}
              onPointerUp={() => setPeek(false)}
              onPointerLeave={() => setPeek(false)}
              className="btn-ghost"
            >
              👁 ดูตัวอย่าง
            </button>
          )}
        </div>
      </div>

      <Popup open={showPopup} onClose={() => setShowPopup(false)}>
        <div className="text-center">
          <div className="polaroid mx-auto mb-4 w-[210px]">
            <img
              src={imgSrc}
              alt="ภาพที่ต่อเสร็จ"
              className="h-[190px] w-full rounded object-cover"
            />
          </div>
          <p className="whitespace-pre-line px-1 font-hand text-xl leading-relaxed text-wine">
            {message}
          </p>
        </div>
      </Popup>
    </FeatureShell>
  )
}
