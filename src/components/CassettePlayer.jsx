import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { loadYouTubeIframeAPI } from '../lib/youtubeApi'

const AUTOPLAY_FALLBACK_MS = 1500

// สุ่ม index ถัดไปแบบไม่ซ้ำกับ index ปัจจุบันทันที
function pickRandomNext(excludeIndex, length) {
  if (length <= 1) return 0
  let next = excludeIndex
  while (next === excludeIndex) {
    next = Math.floor(Math.random() * length)
  }
  return next
}

// เทปคาสเซ็ตลอยมุมล่างขวา — สตรีมเพลงจาก YouTube playlist ผ่าน IFrame Player API
// (ไม่ดาวน์โหลด/เก็บไฟล์เสียงเอง เพราะเว็บนี้เป็น public hosting)
export default function CassettePlayer({ playlistId, kick = 0 }) {
  const playerDivRef = useRef(null)
  const playerRef = useRef(null)

  const apiReadyRef = useRef(false)
  const pendingAutoplayRef = useRef(false)
  const hasPlayedOnceRef = useRef(false)
  const prevKickRef = useRef(kick)
  const playlistIdsRef = useRef([])
  const historyRef = useRef([])
  const currentIndexRef = useRef(0)
  const autoplayTimerRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [playlistLength, setPlaylistLength] = useState(0)
  const [historyLen, setHistoryLen] = useState(0)
  const [title, setTitle] = useState('กำลังเล่นเพลย์ลิสต์...')
  const [currentVideoId, setCurrentVideoId] = useState(null)
  const [showTapHint, setShowTapHint] = useState(false)
  const [thumbBroken, setThumbBroken] = useState(false)

  const hasPlaylist = Boolean(playlistId)

  const captureNowPlaying = () => {
    const p = playerRef.current
    if (!p) return
    if (!playlistIdsRef.current.length) {
      const list = p.getPlaylist?.() || []
      if (list.length) {
        playlistIdsRef.current = list
        setPlaylistLength(list.length)
      }
    }
    const idx = p.getPlaylistIndex?.()
    if (typeof idx === 'number' && idx >= 0) currentIndexRef.current = idx
    const vd = p.getVideoData?.()
    setTitle(vd?.title || 'กำลังเล่นเพลย์ลิสต์...')
    const vid = vd?.video_id || playlistIdsRef.current[currentIndexRef.current] || null
    setThumbBroken(false)
    setCurrentVideoId(vid)
  }

  // ใช้ ref ล้วนสำหรับ logic (กัน stale closure — ฟังก์ชันนี้ถูกเรียกจาก event ที่ผูกไว้ครั้งเดียวตอนสร้าง player)
  const advanceRandom = () => {
    const length = playlistIdsRef.current.length
    if (!length) return
    const current = currentIndexRef.current
    historyRef.current = [...historyRef.current, current]
    setHistoryLen(historyRef.current.length)
    const next = pickRandomNext(current, length)
    currentIndexRef.current = next
    playerRef.current?.playVideoAt?.(next)
  }

  const handlePrevious = () => {
    if (!historyRef.current.length) return
    const prevIndex = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setHistoryLen(historyRef.current.length)
    currentIndexRef.current = prevIndex
    playerRef.current?.playVideoAt?.(prevIndex)
  }

  const handleStateChange = (e) => {
    const YTState = window.YT?.PlayerState
    if (!YTState) return
    const state = e.data
    setPlaying(state === YTState.PLAYING)
    if (state === YTState.PLAYING) {
      hasPlayedOnceRef.current = true
      setUnavailable(false)
      setShowTapHint(false)
    }
    captureNowPlaying()
    if (state === YTState.ENDED) advanceRandom()
  }

  // สร้าง player ครั้งเดียว
  useEffect(() => {
    if (!hasPlaylist) return
    let ignore = false

    loadYouTubeIframeAPI()
      .then((YT) => {
        if (ignore || !playerDivRef.current) return
        playerRef.current = new YT.Player(playerDivRef.current, {
          playerVars: {
            listType: 'playlist',
            list: playlistId,
            controls: 0,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              apiReadyRef.current = true
              if (pendingAutoplayRef.current) {
                pendingAutoplayRef.current = false
                playerRef.current?.playVideo?.()
              }
            },
            onStateChange: handleStateChange,
            onError: () => {
              if (!hasPlayedOnceRef.current) {
                setUnavailable(true)
              } else {
                advanceRandom()
              }
            },
          },
        })
      })
      .catch(() => setUnavailable(true))

    return () => {
      ignore = true
      playerRef.current?.destroy?.()
      playerRef.current = null
      apiReadyRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPlaylist, playlistId])

  // เริ่มเล่นจาก user gesture ตอน PIN ถูก (kick เปลี่ยนค่า) — ต้อง fallback ให้แตะเองได้บน iOS
  useEffect(() => {
    if (kick === prevKickRef.current || !hasPlaylist) return
    prevKickRef.current = kick

    if (playerRef.current && apiReadyRef.current) {
      playerRef.current.playVideo?.()
    } else {
      pendingAutoplayRef.current = true
    }

    clearTimeout(autoplayTimerRef.current)
    autoplayTimerRef.current = setTimeout(() => {
      if (!hasPlayedOnceRef.current) setShowTapHint(true)
    }, AUTOPLAY_FALLBACK_MS)

    return () => clearTimeout(autoplayTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kick, hasPlaylist])

  const toggle = () => {
    const p = playerRef.current
    if (!p || unavailable) return
    if (playing) p.pauseVideo?.()
    else p.playVideo?.()
  }

  const canSkip = playlistLength > 1
  const thumbUrl =
    currentVideoId && !thumbBroken ? `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg` : null

  const marqueeText = unavailable
    ? '♪ เพลย์ลิสต์ไม่พร้อมใช้งาน'
    : showTapHint
      ? '👆 แตะ ▶ เพื่อเริ่มเพลง'
      : `♪ ${title}`

  return (
    <>
      {/* ต้องอยู่ใน DOM ตลอด (แม้ตอนย่อ) ไม่งั้น player instance จะพัง — YouTube ไม่อนุญาตให้ซ่อน player จนมองไม่เห็น */}
      {hasPlaylist && (
        <div
          className="fixed z-20"
          style={{
            right: 'calc(env(safe-area-inset-right, 0px) + 14px)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 78px)',
            width: 48,
            height: 27,
            opacity: minimized ? 0.001 : 1,
            pointerEvents: minimized ? 'none' : 'auto',
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: minimized ? 'none' : '0 4px 10px rgba(0,0,0,0.25)',
            transition: 'opacity 0.2s',
          }}
        >
          <div ref={playerDivRef} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      <div
        className="fixed z-30"
        style={{
          right: 'calc(env(safe-area-inset-right, 0px) + 14px)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        {minimized ? (
          <motion.button
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setMinimized(false)}
            aria-label="ขยายเครื่องเล่นเพลง"
            className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-rose to-cherry text-xl text-white"
            style={{
              border: '2px solid rgba(251,231,173,0.9)',
              boxShadow: 'var(--shadow-3), 0 0 0 1px rgba(184,134,63,0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
            }}
          >
            🎵
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative select-none rounded-2xl p-3"
            style={{
              width: 172,
              background: 'linear-gradient(135deg, #7a1e33, #d62e4f)',
              border: '1px solid rgba(232,185,107,0.55)',
              boxShadow: 'var(--shadow-4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* ปุ่มย่อ */}
            <button
              onClick={() => setMinimized(true)}
              aria-label="ย่อ"
              className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-paper text-sm text-wine shadow active:scale-90"
            >
              –
            </button>

            {/* หน้าต่างเทป */}
            <div className="rounded-lg bg-paper/95 px-2 pb-2 pt-2.5">
              {/* แผ่นเสียง — โชว์ปกเพลงที่กำลังเล่น (แผ่นเดียว) */}
              <div className="flex justify-center pb-1.5">
                <span className={playing ? 'animate-spinReel' : ''}>
                  <span
                    className="relative block overflow-hidden rounded-full bg-white/70"
                    style={{
                      width: 64,
                      height: 64,
                      border: '3px solid transparent',
                      backgroundImage:
                        'linear-gradient(#fff, #fff), var(--foil-gold)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'content-box, border-box',
                      boxShadow: playing
                        ? '0 0 0 3px rgba(247,108,138,0.2), 0 6px 16px rgba(122,30,51,0.4)'
                        : '0 3px 10px rgba(122,30,51,0.3)',
                    }}
                  >
                    {thumbUrl && (
                      <img
                        src={thumbUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={() => setThumbBroken(true)}
                      />
                    )}
                    <span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper"
                      style={{ width: 14, height: 14, boxShadow: 'inset 0 0 0 2px rgba(122,30,51,0.3)' }}
                    />
                  </span>
                </span>
              </div>

              <div className="overflow-hidden">
                <div
                  className={
                    'whitespace-nowrap text-center font-display text-[12px] text-wine ' +
                    (playing ? 'animate-marquee' : '')
                  }
                >
                  {marqueeText}
                </div>
              </div>
            </div>

            {/* ปุ่มควบคุม */}
            <div className="mt-3 flex items-center justify-center gap-2.5 text-paper">
              {canSkip && (
                <button
                  onClick={handlePrevious}
                  disabled={historyLen === 0}
                  aria-label="เพลงก่อนหน้า"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm transition active:scale-90 disabled:opacity-30"
                >
                  ⏮
                </button>
              )}
              <button
                onClick={toggle}
                aria-label={playing ? 'หยุด' : 'เล่น'}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/25 text-base transition active:scale-90"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}
              >
                {playing ? '❚❚' : '►'}
              </button>
              {canSkip && (
                <button
                  onClick={advanceRandom}
                  aria-label="สุ่มเพลงถัดไป"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm transition active:scale-90"
                >
                  🔀
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spinReel { to { transform: rotate(360deg); } }
        .animate-spinReel { display:inline-block; animation: spinReel 2s linear infinite; }
        @keyframes marquee { 0%{transform:translateX(12%)} 100%{transform:translateX(-60%)} }
        .animate-marquee { animation: marquee 6s linear infinite; }
      `}</style>
    </>
  )
}
