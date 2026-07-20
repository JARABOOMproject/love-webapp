import { motion } from 'framer-motion'
import BackButton from './BackButton'

// เปลือกหน้าฟีเจอร์ร่วม: จัด BackButton + หัวข้อ + พื้นที่เนื้อหากึ่งกลาง
export default function FeatureShell({ onBack, title, subtitle, children }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <BackButton onBack={onBack} />

      <header
        className="px-6 pb-2 text-center"
        style={{ paddingTop: 'calc(var(--sat) + 72px)' }}
      >
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="foil-text font-display text-[25px] leading-tight"
          >
            {title}
          </motion.h2>
        )}
        {title && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-2 flex w-28 items-center gap-2"
            aria-hidden
          >
            <span className="foil-line flex-1" />
            <span className="text-[10px] text-gold">♥</span>
            <span className="foil-line flex-1" />
          </motion.div>
        )}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mx-auto mt-1.5 max-w-[300px] text-[13.5px] leading-relaxed"
            style={{ color: 'var(--ink-soft)' }}
          >
            {subtitle}
          </motion.p>
        )}
      </header>

      <div className="flex flex-1 flex-col px-5 pb-32 pt-3">{children}</div>
    </div>
  )
}
