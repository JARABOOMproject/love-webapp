import { AnimatePresence, motion } from 'framer-motion'

// ป้อปอัพกลางจอ ใช้ซ้ำได้ — backdrop blur ชมพู, การ์ดเด้งแบบ spring,
// ตราประทับหัวใจทองมุมขวาบน, ปุ่มปิด ✕
export default function Popup({ open, onClose, children, dismissable = true }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{
            background: 'rgba(122,30,51,0.32)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            paddingBottom: 'calc(1.25rem + var(--sab))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissable ? onClose : undefined}
        >
          <motion.div
            className="paper-texture relative w-full max-w-[360px] bg-paper p-5"
            style={{
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--hairline-gold)',
              boxShadow: 'var(--shadow-4)',
            }}
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
                className="absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full text-wine/70 transition hover:bg-blush/60 active:scale-90"
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
