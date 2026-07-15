import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG, asset } from '../config/love.config'
import { heartConfetti } from '../lib/confetti'
import { placeholderDataUrl } from '../lib/placeholder'
import FeatureShell from '../components/FeatureShell'

export default function LoveLetter({ onBack }) {
  // stage: sealed → opening → open
  const [stage, setStage] = useState('sealed')

  const open = () => {
    if (stage !== 'sealed') return
    setStage('opening')
    setTimeout(() => {
      setStage('open')
      heartConfetti()
    }, 1700)
  }

  return (
    <FeatureShell
      onBack={onBack}
      title="จดหมายถึงเธอ"
      subtitle={stage === 'sealed' ? 'แตะซองเพื่อเปิดอ่าน 💌' : ''}
    >
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {stage !== 'open' ? (
            <Envelope key="env" stage={stage} onOpen={open} />
          ) : (
            <Letter key="letter" />
          )}
        </AnimatePresence>
      </div>
    </FeatureShell>
  )
}

function Envelope({ stage, onOpen }) {
  const opening = stage === 'opening'
  return (
    <motion.div
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
      style={{ width: 280, height: 190, perspective: 900 }}
    >
      {/* ตัวซอง */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(160deg, #fff6f2, #ffe9df)',
          boxShadow: '0 14px 30px rgba(122,30,51,0.2)',
          border: '1px solid rgba(232,185,107,0.5)',
        }}
      />
      {/* สามเหลี่ยมล่างซ้าย/ขวา (ตัวซอง) */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            'linear-gradient(135deg, transparent 49.5%, rgba(247,108,138,0.18) 50%), linear-gradient(-135deg, transparent 49.5%, rgba(247,108,138,0.18) 50%)',
        }}
      />

      {/* กระดาษเลื่อนขึ้นตอนเปิด (โผล่จากในซองเฉพาะตอนเปิด) */}
      <div
        className="absolute left-1/2 top-3 -translate-x-1/2"
        style={{ width: 240, zIndex: 1 }}
      >
        <motion.div
          className="h-[150px] w-full rounded-md bg-white"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          initial={{ y: 0, opacity: 0 }}
          animate={opening ? { y: -120, opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </div>

      {/* ฝาซง (เปิด rotateX) */}
      <motion.div
        className="absolute left-0 top-0 origin-top"
        style={{
          width: 280,
          height: 95,
          zIndex: 3,
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(180deg, #ffe1ea, #ffd0dd)',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          borderRadius: '12px 12px 0 0',
        }}
        animate={opening ? { rotateX: -170 } : { rotateX: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
      />

      {/* ตราประทับขี้ผึ้งหัวใจ (จุดโฟกัสของหน้า) */}
      <div className="absolute left-1/2 top-[62px] z-[5] -translate-x-1/2">
        <motion.button
          onClick={onOpen}
          aria-label="เปิดซองจดหมาย"
          className="grid h-16 w-16 place-items-center rounded-full text-2xl text-white"
          style={{
            background: 'radial-gradient(circle at 38% 32%, #ef4d6a, #d62e4f 60%, #a51f38)',
            boxShadow: '0 6px 14px rgba(214,46,79,0.5), inset 0 2px 6px rgba(255,255,255,0.4)',
          }}
          animate={
            opening
              ? { scale: [1, 1.15, 0], rotate: [0, -8, 12], opacity: [1, 1, 0] }
              : { scale: [1, 1.06, 1] }
          }
          transition={
            opening
              ? { duration: 0.5 }
              : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
          }
          whileTap={{ scale: 0.9 }}
        >
          ♥
        </motion.button>
      </div>

      {!opening && (
        <motion.p
          className="absolute -bottom-9 left-0 w-full text-center text-xs text-wine/50"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          แตะตราหัวใจ
        </motion.p>
      )}
    </motion.div>
  )
}

function Letter() {
  const hasImg = Boolean(CONFIG.letter.image)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="paper-texture relative max-h-[64vh] w-full overflow-y-auto rounded-card bg-[#fffdf8] px-5 py-6 shadow-pop"
      style={{ border: '1px solid rgba(232,185,107,0.5)' }}
    >
      {/* รูปโพลารอยด์เล็ก + เทปวาชิ */}
      {hasImg && (
        <div className="relative mx-auto mb-5 w-[170px]">
          <span
            className="absolute -top-3 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rotate-[-4deg] rounded-sm"
            style={{
              background:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 5px, rgba(247,108,138,0.5) 5px 10px)',
            }}
            aria-hidden
          />
          <div className="polaroid" style={{ transform: 'rotate(-3deg)' }}>
            <img
              src={asset(CONFIG.letter.image)}
              alt=""
              className="h-[150px] w-full rounded object-cover"
              onError={(e) => {
                if (e.currentTarget.dataset.fb) return
                e.currentTarget.dataset.fb = '1'
                e.currentTarget.src = placeholderDataUrl('รูปของเรา', 400, 360, 3)
              }}
            />
          </div>
        </div>
      )}

      <div className="whitespace-pre-line text-center font-hand text-xl leading-relaxed text-wine">
        {CONFIG.letter.text}
      </div>

      <div className="mt-4 text-right font-hand text-lg text-cherry">
        — {CONFIG.coupleNames.me}
      </div>
    </motion.div>
  )
}
