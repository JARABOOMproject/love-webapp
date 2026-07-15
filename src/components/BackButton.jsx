import { motion } from 'framer-motion'

// ปุ่มกลับ Portal — ใช้ร่วมทุก feature view
// วางมุมบนซ้าย เผื่อ safe-area / notch
export default function BackButton({ onBack, label = 'หน้าหลัก' }) {
  return (
    <motion.button
      onClick={onBack}
      whileTap={{ scale: 0.94 }}
      className="fixed z-40 flex items-center gap-1.5 rounded-full bg-blush/90 px-4 py-2 font-display text-[15px] text-wine shadow-card backdrop-blur"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        left: 'calc(env(safe-area-inset-left, 0px) + 14px)',
        border: '1.5px solid var(--rose)',
      }}
      aria-label="กลับหน้าหลัก"
    >
      <span aria-hidden>←</span>
      <span>{label}</span>
    </motion.button>
  )
}
