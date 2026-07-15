import { motion } from 'framer-motion'
import { CONFIG, asset } from '../config/love.config'
import { daysSince } from '../lib/date'
import FloatingHearts from './FloatingHearts'
import {
  IcJigsaw,
  IcScratch,
  IcCalendar,
  IcGacha,
  IcLetter,
  IcGallery,
} from './FeatureIcons'

const CARDS = [
  { key: 'jigsaw', title: 'จิ๊กซอว์', desc: 'ต่อภาพของเรา', Icon: IcJigsaw },
  { key: 'scratch', title: 'ขูดหัวใจ', desc: 'ขูดดูเซอร์ไพรส์', Icon: IcScratch },
  { key: 'days', title: 'นับวันรัก', desc: 'รู้จักกันกี่วันแล้ว', Icon: IcCalendar },
  { key: 'gacha', title: 'ตู้กาชา', desc: 'สุ่มคำจากใจ', Icon: IcGacha },
  { key: 'letter', title: 'ซองจดหมาย', desc: 'เปิดอ่านนะ', Icon: IcLetter },
  { key: 'gallery', title: 'แกลเลอรีหัวใจ', desc: 'ความทรงจำ 3D', Icon: IcGallery },
]

export default function Portal({ onOpen }) {
  const days = daysSince(CONFIG.anniversaryDate)

  return (
    <div
      className="relative min-h-screen"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
      }}
    >
      {/* พื้นหลังรูปจาง ๆ */}
      {CONFIG.portal?.bg && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src={asset(CONFIG.portal.bg)}
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,246,242,.70) 0%, rgba(255,246,242,.86) 45%, rgba(255,246,242,.95) 100%)',
            }}
          />
        </div>
      )}

      <FloatingHearts count={9} />

      <div className="relative z-10 px-5">
        {/* Header */}
        <header className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-blush/70 px-4 py-1.5 text-sm text-wine shadow-card"
          >
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              className="text-cherry"
            >
              ♥
            </motion.span>
            วันที่ {days.toLocaleString('th-TH')} ของเรา
          </motion.div>

          <h1 className="mt-3 font-display text-[24px] leading-snug text-wine">
            {CONFIG.portal?.heading ?? `${CONFIG.coupleNames.me} & ${CONFIG.coupleNames.you}`}
          </h1>
          <p className="mt-1 text-sm text-wine/60">
            {CONFIG.portal?.subtitle ?? 'เลือกของขวัญที่อยากเปิดเลยนะ 🎁'}
          </p>
        </header>

        {/* Grid 2×3 */}
        <div className="grid grid-cols-2 gap-4">
          {CARDS.map((c, i) => (
            <motion.button
              key={c.key}
              onClick={() => onOpen(c.key)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
              whileTap={{ scale: 0.94 }}
              className="paper-texture relative flex flex-col items-center gap-2 rounded-card bg-white/80 px-3 py-5 text-center shadow-card"
              style={{ border: '1px solid rgba(247,108,138,0.25)' }}
            >
              <span className="washi" aria-hidden />
              <span className="relative z-[1] mt-1 grid h-14 w-14 place-items-center rounded-2xl bg-blush/50">
                <c.Icon />
              </span>
              <span className="relative z-[1] font-display text-[17px] text-wine">
                {c.title}
              </span>
              <span className="relative z-[1] text-xs text-wine/55">{c.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
