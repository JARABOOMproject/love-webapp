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
      className="relative min-h-dvh"
      style={{
        paddingTop: 'calc(var(--sat) + 28px)',
        paddingBottom: 'calc(var(--sab) + 96px)',
      }}
    >
      {/* พื้นหลังรูปจาง ๆ */}
      {CONFIG.portal?.bg && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src={asset(CONFIG.portal.bg)}
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,246,242,.72) 0%, rgba(255,246,242,.88) 45%, rgba(255,246,242,.96) 100%)',
            }}
          />
        </div>
      )}

      <FloatingHearts count={9} />

      <div className="relative z-10 px-5">
        {/* Header */}
        <header className="mb-7 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="chip"
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

          <h1 className="foil-text mt-4 font-display text-[26px] leading-snug">
            {CONFIG.portal?.heading ?? `${CONFIG.coupleNames.me} & ${CONFIG.coupleNames.you}`}
          </h1>
          <div className="mx-auto mt-2 flex w-32 items-center gap-2" aria-hidden>
            <span className="foil-line flex-1" />
            <span className="text-[10px] text-gold">♥</span>
            <span className="foil-line flex-1" />
          </div>
          <p className="mt-2 text-[14.5px]" style={{ color: 'var(--ink-soft)' }}>
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
              whileHover={{ y: -3 }}
              className="card-love flex min-h-[150px] flex-col items-center justify-center gap-2.5 px-3 py-6 text-center"
            >
              <span className="washi" aria-hidden />
              {/* มุมทองประดับ */}
              <span
                className="pointer-events-none absolute right-0 top-0 h-9 w-9"
                style={{
                  background:
                    'linear-gradient(225deg, rgba(232,185,107,0.55), rgba(232,185,107,0) 62%)',
                  borderTopRightRadius: 'var(--r-xl)',
                }}
                aria-hidden
              />
              <span
                className="foil-ring grid h-16 w-16 place-items-center rounded-2xl"
              >
                <c.Icon />
              </span>
              <span className="font-display text-[17px] leading-tight text-wine">
                {c.title}
              </span>
              <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                {c.desc}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
