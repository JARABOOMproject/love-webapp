import { AnimatePresence, motion } from 'framer-motion'

// ป้อปอัพกลางจอ ใช้ซ้ำได้ — backdrop blur ชมพู, การ์ดเด้งแบบ spring,
// ตราประทับหัวใจทองมุมขวาบน, ปุ่มปิด ✕
export default function Popup({ open, onClose, children, dismissable = true }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(247,108,138,0.28)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissable ? onClose : undefined}
        >
          <motion.div
            className="paper-texture relative w-full max-w-[360px] rounded-[22px] bg-paper p-5 shadow-pop"
            style={{ border: '1px solid rgba(232,185,107,0.4)' }}
            initial={{ scale: 0.8, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ตราประทับหัวใจทอง */}
            <div className="stamp absolute -right-3 -top-3 z-10 bg-paper" aria-hidden>
              ♥
            </div>

            {dismissable && (
              <button
                onClick={onClose}
                aria-label="ปิด"
                className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-wine/60 transition hover:bg-blush/60"
              >
                ✕
              </button>
            )}

            <div className="relative z-[1] pt-1">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
