import { motion, useMotionValue, useSpring } from 'framer-motion'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// การ์ด 3D เอียงตามนิ้ว/เมาส์ (parallax) — ใช้ perspective + preserve-3d
// เนื้อหาข้างในซ้อนความลึกได้ด้วย translateZ (ส่งผ่าน prop depthChildren)
export default function TiltCard({
  onClick,
  index = 0,
  className = '',
  max = 16,
  children,
}) {
  const reduced = reducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 14 })
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 14 })

  const onPointerMove = (e) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.button
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerUp={reset}
      onPointerCancel={reset}
      initial={{ opacity: 0, y: 20, rotateX: -14 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 220, damping: 20 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 700,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.button>
  )
}
