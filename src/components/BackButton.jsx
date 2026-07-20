import { motion } from 'framer-motion'

// ปุ่มกลับ Portal — ใช้ร่วมทุก feature view
// วางมุมบนซ้าย เผื่อ safe-area / notch
export default function BackButton({ onBack, label = 'หน้าหลัก' }) {
  return (
    <motion.button
      onClick={onBack}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.94 }}
      className="fixed z-40 flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 font-display text-[15px] text-wine backdrop-blur"
      style={{
        top: 'calc(var(--sat) + 14px)',
        left: 'calc(var(--sal) + 14px)',
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid var(--hairline)',
        boxShadow: 'var(--shadow-2)',
      }}
      aria-label="กลับหน้าหลัก"
    >
      <span aria-hidden className="text-cherry">←</span>
      <span>{label}</span>
    </motion.button>
  )
}
