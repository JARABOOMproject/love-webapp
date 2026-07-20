import { useState } from 'react'
import { motion } from 'framer-motion'
import { CONFIG } from '../config/love.config'
import { heartBurst } from '../lib/confetti'
import FloatingHearts from './FloatingHearts'

const PIN_LEN = 6

export default function PinLogin({ onUnlock }) {
  const [digits, setDigits] = useState('')
  const [status, setStatus] = useState('idle') // idle | wrong | ok

  const press = (n) => {
    if (status === 'ok') return
    if (digits.length >= PIN_LEN) return
    const next = digits + n
    setStatus('idle')
    setDigits(next)
    if (next.length === PIN_LEN) check(next)
  }

  const del = () => {
    if (status === 'ok') return
    setStatus('idle')
    setDigits((d) => d.slice(0, -1))
  }

  const check = (value) => {
    if (value === CONFIG.pin) {
      setStatus('ok')
      heartBurst()
      setTimeout(() => onUnlock(), 950)
    } else {
      setStatus('wrong')
      // สั่น + แดงแวบ แล้วเคลียร์
      setTimeout(() => {
        setDigits('')
        setStatus('idle')
      }, 500)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center px-8"
      style={{
        paddingTop: 'calc(var(--sat) + 24px)',
        paddingBottom: 'calc(var(--sab) + 24px)',
      }}
    >
      <FloatingHearts count={8} />

      <div className="relative z-10 flex w-full flex-col items-center">
        {/* ตราซองจดหมาย + วงแสงนุ่ม ๆ ด้านหลัง */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="relative mb-5 grid h-28 w-28 place-items-center"
          aria-hidden
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(255,217,227,0.9), rgba(255,217,227,0) 70%)',
            }}
          />
          {/* วงแหวนทองประดับ + แสง shimmer หมุนช้า */}
          <span
            className="foil-ring sheen absolute inset-2 rounded-full"
            style={{ opacity: 0.95 }}
          />
          <span
            className="absolute inset-2 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.85), rgba(255,246,242,0.6) 60%, rgba(255,246,242,0) 72%)',
            }}
          />
          <motion.span
            className="relative text-[58px] leading-none"
            style={{ filter: 'drop-shadow(0 8px 18px rgba(214,46,79,0.28))' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            💌
          </motion.span>
        </motion.div>

        <h1 className="foil-text text-center font-display text-[28px] leading-tight">
          {CONFIG.pinTitle}
        </h1>

        {/* เส้นคั่นทอง + หัวใจ */}
        <div className="mt-2.5 flex w-40 items-center gap-2" aria-hidden>
          <span className="foil-line flex-1" />
          <span className="text-xs text-gold">♥</span>
          <span className="foil-line flex-1" />
        </div>

        <p className="mt-2 text-center text-[15px]" style={{ color: 'var(--ink-soft)' }}>
          {CONFIG.pinPrompt}
        </p>

        {/* dots — ว่าง → หัวใจเมื่อกด */}
        <motion.div
          className="mt-8 flex gap-3.5"
          animate={status === 'wrong' ? { x: [0, -10, 10, -8, 8, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: PIN_LEN }).map((_, i) => {
            const filled = i < digits.length
            const wrong = status === 'wrong'
            const ok = status === 'ok'
            return (
              <motion.div
                key={i}
                className="grid h-7 w-7 place-items-center"
                animate={ok ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={ok ? { duration: 0.5, repeat: 1, delay: i * 0.05 } : {}}
              >
                {filled ? (
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="text-[23px] leading-none"
                    style={{
                      color: wrong ? '#e0113a' : 'var(--cherry)',
                      filter: ok
                        ? 'drop-shadow(0 0 8px rgba(214,46,79,0.6))'
                        : 'drop-shadow(0 2px 3px rgba(214,46,79,0.25))',
                    }}
                  >
                    ♥
                  </motion.span>
                ) : (
                  <span
                    className="block h-3 w-3 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.35)',
                      border: `2px solid ${wrong ? '#e0113a' : 'var(--rose)'}`,
                      opacity: 0.55,
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* numpad */}
        <div className="mt-9 grid grid-cols-3 gap-4">
          {keys.map((k, i) => {
            if (k === '') return <div key={i} className="h-16 w-16" aria-hidden />
            if (k === 'del')
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.88 }}
                  onClick={del}
                  aria-label="ลบ"
                  className="grid h-16 w-16 place-items-center rounded-full text-2xl transition active:bg-blush/60"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  ⌫
                </motion.button>
              )
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => press(k)}
                className="glass grid h-16 w-16 place-items-center rounded-full font-display text-2xl text-wine transition active:brightness-95"
                style={{
                  border: '1px solid rgba(232,185,107,0.45)',
                  boxShadow:
                    '0 8px 18px rgba(214,46,79,0.15), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(255,255,255,0.4)',
                }}
              >
                {k}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
