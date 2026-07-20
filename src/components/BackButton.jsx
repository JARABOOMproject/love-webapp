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
      className="glass fixed z-40 flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 font-display text-[15px] text-wine"
      style={{
        top: 'calc(var(--sat) + 14px)',
        left: 'calc(var(--sal) + 14px)',
        border: '1px solid rgba(232,185,107,0.5)',
      }}
      aria-label="กลับหน้าหลัก"
    >
      <span aria-hidden className="text-cherry">←</span>
      <span>{label}</span>
    </motion.button>
  )
}
