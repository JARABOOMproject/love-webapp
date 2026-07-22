import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { AnimatePresence, motion } from 'framer-motion'
import { CONFIG, asset } from '../config/love.config'
import { loadImageWithFallback } from '../lib/placeholder'
import { heartConfetti } from '../lib/confetti'
import BackButton from '../components/BackButton'

// จุดบนเส้นโค้งหัวใจ (parametric) → ใช้จัดอนุภาคให้ก่อตัวเป็นเส้นขอบหัวใจ
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3)
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  return { x: x / 16, y: y / 16 }
}

// โหลดรูป → ย่อ ≤512px → CanvasTexture (คุมประสิทธิภาพ)
async function loadTexture(src, label, seed) {
  const img = await loadImageWithFallback(src, label, seed, 512)
  const max = 512
  let w = img.width || max
  let h = img.height || max
  const scale = Math.min(1, max / Math.max(w, h))
  w = Math.max(1, Math.round(w * scale))
  h = Math.max(1, Math.round(h * scale))
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  cv.getContext('2d').drawImage(img, 0, 0, w, h)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  return { tex, aspect: w / h }
}

// ลำดับซีน: intro → greeting → scatter → globe → wall → finale
const NEXT = { scatter: 'globe', globe: 'wall', wall: 'finale' }
// เวลาอยู่ต่อซีน (ms) — reduce-motion หารครึ่ง
const DUR = { scatter: 3600, globe: 4600, wall: 3200 }

export default function HeartGallery3D({ onBack }) {
  const mountRef = useRef(null)
  const sceneRef = useRef('intro')
  const [scene, setScene] = useState('intro')
  const [greetIdx, setGreetIdx] = useState(0)

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const story = CONFIG.galleryStory
  const advance = () => setScene((s) => NEXT[s] || s)

  // บอกลูป Three.js ว่าอยู่ซีนไหน (โดยไม่ re-run effect ก้อนใหญ่)
  useEffect(() => {
    sceneRef.current = scene
  }, [scene])

  // ── ตัวคุมลำดับซีน ──
  // ข้อความทักทายไล่ทีละบรรทัด
  useEffect(() => {
    if (scene !== 'greeting') return
    if (greetIdx >= story.greetings.length) {
      setScene('scatter')
      return
    }
    const t = setTimeout(() => setGreetIdx((i) => i + 1), reduced ? 1100 : 1900)
    return () => clearTimeout(t)
  }, [scene, greetIdx, reduced, story.greetings.length])

  // scatter / globe / wall เดินหน้าอัตโนมัติ
  useEffect(() => {
    if (!(scene in DUR)) return
    const t = setTimeout(() => advance(), DUR[scene] * (reduced ? 0.5 : 1))
    return () => clearTimeout(t)
  }, [scene, reduced])

  // โปรยหัวใจตอนถึงจดหมาย
  useEffect(() => {
    if (scene === 'finale') heartConfetti()
  }, [scene])

  // ── ฉาก Three.js (สร้างครั้งเดียว, อ่านซีนจาก sceneRef ทุกเฟรม) ──
  useEffect(() => {
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight
    const lowMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const scene3 = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 0, 6.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(W, H)
    mount.appendChild(renderer.domElement)
    scene3.add(new THREE.AmbientLight(0xffffff, 1))

    const group = new THREE.Group()
    scene3.add(group)

    // ระยะที่มองเห็นบนระนาบการ์ด (z=0) → ใช้จัดเลย์เอาต์ให้พอดีจอ
    const vH = 2 * camera.position.z * Math.tan((50 * Math.PI) / 360)
    const vW = vH * (W / H)

    // สุ่มแบบคงที่จาก index (เลย์เอาต์เดิมทุกครั้ง)
    const rand = (i, s) => {
      const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453
      return v - Math.floor(v)
    }

    // ── อนุภาคหัวใจ + เป้าหมายรูปหัวใจ (ซีน intro) ──
    const pCount = 120
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(pCount * 3)
    const pHeart = new Float32Array(pCount * 3) // เป้าหมายเส้นขอบหัวใจ
    const pSpeed = new Float32Array(pCount)
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 11
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 11
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1
      const hp = heartPoint((i / pCount) * Math.PI * 2)
      pHeart[i * 3] = hp.x * 2.7
      pHeart[i * 3 + 1] = hp.y * 2.7 + 0.2
      pHeart[i * 3 + 2] = (rand(i, 5) - 0.5) * 0.5
      pSpeed[i] = 0.004 + Math.random() * 0.006
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const heartSprite = makeHeartSprite()
    const pMat = new THREE.PointsMaterial({
      size: 0.3,
      map: heartSprite,
      transparent: true,
      color: 0xff9bb3,
      depthWrite: false,
      opacity: 0.9,
    })
    const points = new THREE.Points(pGeo, pMat)
    scene3.add(points)

    // ── เลย์เอาต์รูป: scatter / sphere / wall ──
    // รูปมีจำกัด → ทำซ้ำ (สลับสับเปลี่ยน) ให้ครบจำนวนเยอะ ๆ ทรงลูกโลก/กำแพงจะแน่นเหมือนรูปโลก
    const uniq = CONFIG.gallery
    const U = uniq.length
    const n = Math.max(U, 120) // จำนวนการ์ดจริงบนจอ
    // สไตรด์แบบสัดส่วนทองคำ → เพื่อนบ้านไม่ซ้ำรูป และกระจายทั่วทั้งชุด
    let stride = Math.max(1, Math.round(U / 1.61803))
    while (U > 1 && gcd(stride, U) !== 1) stride = stride > 1 ? stride - 1 : 1
    const order = Array.from({ length: n }, (_, k) => (k * stride) % U)
    // โหลด texture ของรูป "ไม่ซ้ำ" ครั้งเดียว แล้วแชร์ให้การ์ดที่ใช้รูปเดียวกัน
    const texCache = new Array(U).fill(null)
    const texJobs = uniq.map((src, ui) =>
      loadTexture(asset(src), `รูปที่ ${ui + 1}`, ui).then((r) => {
        texCache[ui] = r
        return r
      })
    )

    // กริดกำแพงภาพให้พอดีกรอบจอ
    const cols = Math.max(3, Math.round(Math.sqrt(n * (vW / vH))))
    const rows = Math.ceil(n / cols)
    const spX = vW / cols
    const spY = vH / rows
    const cell = Math.min(spX, spY)
    const S = cell * 0.92 // ขนาดการ์ด
    const R = Math.min(vW, vH) * 0.62 // รัศมีลูกโลก

    const scatterPos = (i) =>
      new THREE.Vector3(
        (rand(i, 1) - 0.5) * vW * 1.05,
        (rand(i, 2) - 0.5) * vH * 0.95,
        (rand(i, 3) - 0.5) * 2.6
      )
    const spherePos = (i) => {
      const y = 1 - (i / Math.max(1, n - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * Math.PI * (3 - Math.sqrt(5))
      return new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).multiplyScalar(R)
    }
    const wallPos = (i) => {
      const c = i % cols
      const r = Math.floor(i / cols)
      return new THREE.Vector3(
        (c - (cols - 1) / 2) * spX,
        ((rows - 1) / 2 - r) * spY,
        0
      )
    }

    const CENTER = new THREE.Vector3(0, 0, 0)
    const Z = new THREE.Vector3(0, 0, 1)
    const cards = []
    let disposed = false

    order.forEach((si, i) => {
      const card = new THREE.Group()
      card.position.copy(CENTER)
      card.scale.setScalar(0.01)

      const frameMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
      })
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(S * 1.14, S * 1.14), frameMat)
      frame.position.z = -0.01
      card.add(frame)

      const imgMat = new THREE.MeshBasicMaterial({
        color: 0xffd9e3,
        transparent: true,
        opacity: 0,
      })
      const imgMesh = new THREE.Mesh(new THREE.PlaneGeometry(S, S), imgMat)
      card.add(imgMesh)

      // เป้าหมายตำแหน่ง/การหันหน้า ต่อซีน
      const pScatter = scatterPos(i)
      const pSphere = spherePos(i)
      const pWall = wallPos(i)
      const qScatter = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, (rand(i, 6) - 0.5) * 0.3, (rand(i, 7) - 0.5) * 0.4)
      )
      const qSphere = new THREE.Quaternion().setFromUnitVectors(
        Z,
        pSphere.clone().normalize()
      )
      const qWall = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 0, (rand(i, 8) - 0.5) * 0.06)
      )

      card.userData = {
        pScatter, pSphere, pWall, qScatter, qSphere, qWall,
        frameMat, imgMat, frame, imgMesh,
      }

      group.add(card)
      cards.push(card)

      texJobs[si].then(({ tex, aspect }) => {
        if (disposed) return
        imgMat.map = tex
        imgMat.color.set(0xffffff)
        imgMat.needsUpdate = true
        const w = aspect >= 1 ? S : S * aspect
        const h = aspect >= 1 ? S / aspect : S
        imgMesh.scale.set(w / S, h / S, 1)
        frame.scale.set((w + S * 0.14) / (S * 1.14), (h + S * 0.14) / (S * 1.14), 1)
      })
    })

    // ── loop ──
    const clock = new THREE.Clock()
    const tmpV = new THREE.Vector3()
    const tmpS = new THREE.Vector3()
    let opacity = 0 // ความทึบรวมของการ์ด (fade in/out)
    let raf

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const et = clock.getElapsedTime()
      const sc = sceneRef.current
      const layout =
        sc === 'scatter' ? 'scatter'
        : sc === 'globe' ? 'sphere'
        : sc === 'wall' || sc === 'finale' ? 'wall'
        : 'hidden'

      // ความทึบเป้าหมาย
      const targetOp = layout === 'hidden' ? 0 : sc === 'finale' ? 0 : 1
      opacity += (targetOp - opacity) * 0.08

      // หมุนกลุ่ม: ลูกโลกหมุนต่อเนื่อง, ซีนอื่นคลายกลับ 0
      if (layout === 'sphere') group.rotation.y += lowMotion ? 0.002 : 0.006
      else group.rotation.y += (0 - group.rotation.y) * 0.05
      // โยกเบา ๆ ให้มีชีวิต (ยกเว้นกำแพง/จบ ที่อยากให้นิ่งตรง)
      const bob = layout === 'scatter' || layout === 'sphere'
      group.position.y = bob && !lowMotion ? Math.sin(et * 0.5) * 0.12 : group.position.y * 0.9

      cards.forEach((card, i) => {
        const u = card.userData
        let tp, tq, ts
        if (layout === 'hidden') { tp = CENTER; tq = u.qScatter; ts = 0.01 }
        else if (layout === 'scatter') { tp = u.pScatter; tq = u.qScatter; ts = 1 }
        else if (layout === 'sphere') { tp = u.pSphere; tq = u.qSphere; ts = 0.9 }
        else { tp = u.pWall; tq = u.qWall; ts = 1 }

        // ดีเลย์ไล่ทีละใบตอน scatter ให้ดูรูปทยอยลอยออกมา
        const k = layout === 'scatter' ? 0.06 + rand(i, 9) * 0.05 : 0.09
        card.position.lerp(tp, k)
        card.quaternion.slerp(tq, k)
        tmpS.setScalar(ts)
        card.scale.lerp(tmpS, k)

        u.imgMat.opacity = opacity
        u.frameMat.opacity = opacity
      })

      // อนุภาค: intro → ดูดเข้าเส้นหัวใจ, ซีนอื่น → ลอยขึ้นเบา ๆ แล้วหรี่ลง
      const pa = pGeo.attributes.position
      if (sc === 'intro') {
        for (let i = 0; i < pCount; i++) {
          pa.array[i * 3] += (pHeart[i * 3] - pa.array[i * 3]) * 0.06
          pa.array[i * 3 + 1] += (pHeart[i * 3 + 1] - pa.array[i * 3 + 1]) * 0.06
          pa.array[i * 3 + 2] += (pHeart[i * 3 + 2] - pa.array[i * 3 + 2]) * 0.06
        }
        pMat.opacity += (0.95 - pMat.opacity) * 0.05
      } else {
        if (!lowMotion) {
          for (let i = 0; i < pCount; i++) {
            pa.array[i * 3 + 1] += pSpeed[i]
            if (pa.array[i * 3 + 1] > 5.5) pa.array[i * 3 + 1] = -5.5
          }
        }
        const pTarget = sc === 'greeting' ? 0.85 : 0.28
        pMat.opacity += (pTarget - pMat.opacity) * 0.04
      }
      pa.needsUpdate = true
      points.rotation.y += 0.0006

      renderer.render(scene3, camera)
    }
    tick()

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      scene3.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) o.material.dispose()
      })
      texCache.forEach((r) => r && r.tex.dispose()) // texture แชร์ → dispose ครั้งเดียว
      heartSprite.dispose()
      if (renderer.domElement.parentNode)
        renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  const showSkip = scene === 'scatter' || scene === 'globe' || scene === 'wall'

  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #2a0713 0%, #5c1526 45%, #a51f38 100%)',
      }}
    >
      <BackButton onBack={onBack} />
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      {/* ชั้นแตะเพื่อไปต่อ ระหว่างซีนรูป */}
      {showSkip && (
        <button
          onClick={advance}
          aria-label="ไปต่อ"
          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
        />
      )}

      <AnimatePresence mode="wait">
        {/* ── intro: กดค้างเพื่อเริ่ม ── */}
        {scene === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <HoldToStart
              label={story.holdHint}
              reduced={reduced}
              onStart={() => setScene('greeting')}
            />
          </motion.div>
        )}

        {/* ── greeting: ข้อความทักทายไล่บรรทัด ── */}
        {scene === 'greeting' && (
          <motion.button
            key={`greet-${greetIdx}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
            onClick={() => setGreetIdx((i) => i + 1)}
            className="absolute inset-0 grid place-items-center px-8"
          >
            <span className="foil-text-deep text-center font-display text-3xl leading-snug">
              {story.greetings[Math.min(greetIdx, story.greetings.length - 1)]}
            </span>
          </motion.button>
        )}

        {/* ── finale: ผีเสื้อ + จดหมาย ── */}
        {scene === 'finale' && (
          <motion.div
            key="finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 grid place-items-center px-5 py-16"
          >
            <FinaleLetter story={story} sender={CONFIG.coupleNames.me} />
          </motion.div>
        )}
      </AnimatePresence>

      {showSkip && (
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-xs text-white/55">
          แตะเพื่อไปต่อ ›
        </div>
      )}
    </div>
  )
}

// ── ปุ่มกดค้างเพื่อเริ่ม (มีวงแหวนเติมความคืบหน้า) ──
function HoldToStart({ label, onStart, reduced }) {
  const [holding, setHolding] = useState(false)
  const timer = useRef(null)
  const HOLD = reduced ? 250 : 750
  const C = 2 * Math.PI * 46 // เส้นรอบวง

  const begin = () => {
    setHolding(true)
    timer.current = setTimeout(() => {
      setHolding(false)
      onStart()
    }, HOLD)
  }
  const cancel = () => {
    setHolding(false)
    clearTimeout(timer.current)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div className="pointer-events-auto flex flex-col items-center">
      <button
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        aria-label={label}
        className="relative grid h-32 w-32 select-none place-items-center"
        style={{ touchAction: 'none' }}
      >
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
          <circle
            cx="50" cy="50" r="46" fill="none"
            stroke="#ffd1dd" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={holding ? 0 : C}
            style={{ transition: `stroke-dashoffset ${HOLD}ms linear` }}
          />
        </svg>
        <motion.span
          className="text-5xl"
          style={{ color: '#ff9bb3', filter: 'drop-shadow(0 2px 8px rgba(255,120,150,0.6))' }}
          animate={holding ? { scale: 1.18 } : { scale: [1, 1.08, 1] }}
          transition={holding ? { duration: 0.75 } : { duration: 1.6, repeat: Infinity }}
        >
          ♥
        </motion.span>
      </button>
      <p className="mt-4 text-sm tracking-wide text-white/85">{label}</p>
    </div>
  )
}

// ── จดหมายตอนจบ + ผีเสื้อ ──
function FinaleLetter({ story, sender }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 190, damping: 22 }}
      className="w-full max-w-app"
    >
      {/* ทุกอย่างอยู่ในกล่องเลื่อนเดียว → เลื่อนแล้วหัว (ผีเสื้อ+หัวข้อ) เลื่อนหายไปเหมือนกระดาษจริง */}
      <div
        className="max-h-[74dvh] overflow-y-auto px-6 py-7"
        style={{
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--hairline-gold)',
          boxShadow: 'var(--shadow-4), inset 0 0 0 2px rgba(232,185,107,0.22)',
          background: 'repeating-linear-gradient(#fffdf8 0 30px, rgba(214,46,79,0.05) 30px 31px)',
          outline: '1px solid rgba(232,185,107,0.25)',
          outlineOffset: '-6px',
        }}
      >
        {/* ผีเสื้อสีชมพู — อยู่ในกระแสเลื่อน จะเลื่อนขึ้นหายไปพร้อมกระดาษ */}
        <motion.div
          className="mb-1 text-center text-4xl"
          style={{ filter: 'hue-rotate(285deg) saturate(1.6) drop-shadow(0 3px 6px rgba(180,40,90,0.4))' }}
          animate={{ y: [0, -6, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          🦋
        </motion.div>
        <h2 className="mb-4 text-center font-display text-2xl text-cherry">
          {story.letterTitle}
        </h2>

        <div className="whitespace-pre-line text-center font-hand text-xl leading-relaxed text-wine">
          {story.letterText}
        </div>

        <p className="mt-5 text-center font-hand text-lg text-cherry">
          {story.letterClosing}
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="h-px w-10 bg-gold/50" aria-hidden />
          <span className="font-hand text-lg text-cherry">— {sender}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ห.ร.ม. — ใช้หาสไตรด์ที่ coprime กับจำนวนรูป (ทำซ้ำแล้วกระจายทั่ว ไม่ซ้ำติดกัน)
function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

// สร้าง sprite หัวใจเล็กสำหรับ particles
function makeHeartSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  const x = 32
  const y = 26
  ctx.moveTo(x, y + 8)
  ctx.bezierCurveTo(x, y, x - 14, y - 4, x - 14, y + 8)
  ctx.bezierCurveTo(x - 14, y + 18, x, y + 26, x, y + 34)
  ctx.bezierCurveTo(x, y + 26, x + 14, y + 18, x + 14, y + 8)
  ctx.bezierCurveTo(x + 14, y - 4, x, y, x, y + 8)
  ctx.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
