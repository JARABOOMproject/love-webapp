import { motion } from 'framer-motion'
import BackButton from './BackButton'

// เปลือกหน้าฟีเจอร์ร่วม: จัด BackButton + หัวข้อ + พื้นที่เนื้อหากึ่งกลาง
export default function FeatureShell({ onBack, title, subtitle, children }) {
  return (
    <div className="relative flex min-h-full flex-col">
      <BackButton onBack={onBack} />

      <header
        className="px-6 pb-2 text-center"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 68px)' }}
      >
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-2xl text-wine"
          >
            {title}
          </motion.h2>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-wine/60">{subtitle}</p>
        )}
      </header>

      <div className="flex flex-1 flex-col px-5 pb-28 pt-2">{children}</div>
    </div>
  )
}
