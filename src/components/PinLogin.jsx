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
      className="relative flex min-h-screen flex-col items-center justify-center px-8"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <FloatingHearts count={8} />

      <div className="relative z-10 flex w-full flex-col items-center">
        {/* ตราซองจดหมาย */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mb-6 text-6xl"
          aria-hidden
        >
          💌
        </motion.div>

        <h1 className="text-center font-display text-2xl text-wine">
          {CONFIG.coupleNames.me} <span className="text-cherry">♥</span>{' '}
          {CONFIG.coupleNames.you}
        </h1>
        <p className="mt-2 text-center text-[15px] text-wine/70">
          {CONFIG.pinPrompt}
        </p>

        {/* dots — ว่าง → หัวใจเมื่อกด */}
        <motion.div
          className="mt-8 flex gap-3"
          animate={
            status === 'wrong'
              ? { x: [0, -10, 10, -8, 8, -4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: PIN_LEN }).map((_, i) => {
            const filled = i < digits.length
            const wrong = status === 'wrong'
            const ok = status === 'ok'
            return (
              <motion.div
                key={i}
                className="grid h-6 w-6 place-items-center"
                animate={
                  ok
                    ? { scale: [1, 1.4, 1] }
                    : { scale: 1 }
                }
                transition={
                  ok
                    ? { duration: 0.5, repeat: 1, delay: i * 0.05 }
                    : {}
                }
              >
                {filled ? (
                  <span
                    className="text-[22px] leading-none"
                    style={{ color: wrong ? '#e11' : 'var(--cherry)' }}
                  >
                    ♥
                  </span>
                ) : (
                  <span
                    className="block h-3 w-3 rounded-full"
                    style={{
                      background: 'transparent',
                      border: `2px solid ${wrong ? '#e11' : 'var(--rose)'}`,
                      opacity: 0.6,
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
            if (k === '')
              return <div key={i} className="h-16 w-16" aria-hidden />
            if (k === 'del')
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={del}
                  aria-label="ลบ"
                  className="grid h-16 w-16 place-items-center rounded-full text-2xl text-wine/70 transition active:bg-blush/60"
                >
                  ⌫
                </motion.button>
              )
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => press(k)}
                className="grid h-16 w-16 place-items-center rounded-full bg-white/70 font-display text-2xl text-wine shadow-card transition active:bg-blush"
                style={{ border: '1px solid rgba(247,108,138,0.35)' }}
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
