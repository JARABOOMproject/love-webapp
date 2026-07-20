import { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG } from './config/love.config'

import PinLogin from './components/PinLogin'
import Portal from './components/Portal'
import CassettePlayer from './components/CassettePlayer'

import DaysCounter from './features/DaysCounter'
import Gacha from './features/Gacha'
import ScratchCard from './features/ScratchCard'
import Jigsaw from './features/Jigsaw'
import LoveLetter from './features/LoveLetter'
// Three.js หนัก → โหลดเฉพาะตอนเปิดแกลเลอรี (โหลดหน้าแรกเร็วขึ้นบน 4G)
const HeartGallery3D = lazy(() => import('./features/HeartGallery3D'))

const AUTH_KEY = 'love_authed'

// slide + fade page transition (300ms)
const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}
const pageTransition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] }

function GalleryLoading() {
  return (
    <div
      className="grid min-h-dvh place-items-center text-white"
      style={{ background: 'linear-gradient(160deg,#f76c8a,#a51f38 60%,#5c1526)' }}
    >
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-11 w-11 rounded-full"
          style={{
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: '#f6d78a',
            borderRightColor: '#e8b96b',
            boxShadow: '0 0 16px rgba(232,185,107,0.5)',
            animation: 'galSpin 0.9s linear infinite',
          }}
        />
        <div className="animate-pulse text-4xl drop-shadow">♥</div>
        <p className="mt-3 text-sm tracking-wide text-white/85">กำลังโหลดความทรงจำ…</p>
      </div>
      <style>{`@keyframes galSpin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('pin')
  // สั่งให้เทปเพลงเริ่มเล่น (จาก user gesture ตอน PIN ถูก)
  const [musicKick, setMusicKick] = useState(0)

  // sessionStorage: ปิดแอปแล้วเปิดใหม่ต้องใส่ PIN อีกครั้ง
  useEffect(() => {
    try {
      if (sessionStorage.getItem(AUTH_KEY) === '1') setView('portal')
    } catch {
      /* ignore */
    }
  }, [])

  const handleUnlock = () => {
    try {
      sessionStorage.setItem(AUTH_KEY, '1')
    } catch {
      /* ignore */
    }
    setMusicKick((k) => k + 1) // เริ่มเพลงจาก gesture นี้
    setView('portal')
  }

  const goPortal = () => setView('portal')

  const renderFeature = () => {
    switch (view) {
      case 'days':
        return <DaysCounter onBack={goPortal} />
      case 'gacha':
        return <Gacha onBack={goPortal} />
      case 'scratch':
        return <ScratchCard onBack={goPortal} />
      case 'jigsaw':
        return <Jigsaw onBack={goPortal} />
      case 'letter':
        return <LoveLetter onBack={goPortal} />
      case 'gallery':
        return (
          <Suspense fallback={<GalleryLoading />}>
            <HeartGallery3D onBack={goPortal} />
          </Suspense>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-full w-full">
      {/* กรอบแอป mobile-first กึ่งกลาง */}
      <div className="grain relative mx-auto min-h-dvh w-full max-w-app overflow-hidden bg-paper shadow-[0_0_80px_rgba(214,46,79,0.12)]">
        <AnimatePresence mode="wait">
          {view === 'pin' && (
            <motion.div
              key="pin"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-dvh"
            >
              <PinLogin onUnlock={handleUnlock} />
            </motion.div>
          )}

          {view === 'portal' && (
            <motion.div
              key="portal"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-dvh"
            >
              <Portal onOpen={setView} />
            </motion.div>
          )}

          {view !== 'pin' && view !== 'portal' && (
            <motion.div
              key={view}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="min-h-dvh"
            >
              {renderFeature()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* เทปเพลง — ทุกหน้ายกเว้น PIN */}
        {view !== 'pin' && (
          <CassettePlayer playlistId={CONFIG.music.youtubePlaylistId} kick={musicKick} />
        )}
      </div>
    </div>
  )
}
