import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CONFIG, asset } from '../config/love.config'
import { loadImageWithFallback } from '../lib/placeholder'
import BackButton from '../components/BackButton'

// จุดบนเส้นโค้งหัวใจ (parametric) → ตำแหน่งการ์ดรูป
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

export default function HeartGallery3D({ onBack }) {
  const mountRef = useRef(null)
  const [hint, setHint] = useState(true)

  useEffect(() => {
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
    camera.position.set(0, 0, 6.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(W, H)
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 1))

    const group = new THREE.Group()
    scene.add(group)

    // ── heart particles ──
    const pCount = 50
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 10
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const heartSprite = makeHeartSprite()
    const pMat = new THREE.PointsMaterial({
      size: 0.28,
      map: heartSprite,
      transparent: true,
      color: 0xff9bb3,
      depthWrite: false,
      opacity: 0.8,
    })
    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    // ── การ์ดรูป ──
    const imgs = CONFIG.gallery
    const n = imgs.length
    const cards = []
    const cardMeshes = []
    let disposed = false

    // ย่อการ์ดตามจำนวนรูป (รูปเยอะ = การ์ดเล็กลง ไม่ให้ทับกัน)
    const IMG = THREE.MathUtils.clamp(3.4 / Math.sqrt(n), 0.34, 0.82)
    const BORDER = IMG * 0.14
    const FRAME = IMG + BORDER
    // ระยะกล้องถอยตามจำนวน เพื่อให้เห็นทั้งหัวใจ
    camera.position.z = THREE.MathUtils.clamp(5 + n * 0.045, 5.5, 8.5)

    // สุ่มแบบคงที่จาก index (เลย์เอาต์เดิมทุกครั้ง)
    const rand = (i, s) => {
      const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453
      return v - Math.floor(v)
    }
    const CENTER = new THREE.Vector3(0, 0.35, 0)

    imgs.forEach((src, i) => {
      // ทิศทางบนเส้นหัวใจ แล้วดึงเข้าด้านในแบบสุ่ม → เติมเต็มทรงหัวใจ
      const t = (i / n) * Math.PI * 2 + rand(i, 3) * 0.25
      const p = heartPoint(t)
      const boundary = new THREE.Vector3(p.x * 3.4, p.y * 3.4 + 0.35, 0)
      const r = 0.32 + rand(i, 1) * 0.68
      const pos = CENTER.clone().lerp(boundary, r)
      pos.z = (rand(i, 2) - 0.5) * 2.0

      const card = new THREE.Group()
      card.position.copy(pos)
      card.userData = {
        base: card.position.clone(),
        index: i,
        selected: false,
        returning: false,
      }

      // กรอบขาว
      const frame = new THREE.Mesh(
        new THREE.PlaneGeometry(FRAME, FRAME),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      )
      frame.position.z = -0.01
      card.add(frame)

      // รูป (placeholder ก่อน แล้วอัปเดตเมื่อโหลดเสร็จ)
      const imgMat = new THREE.MeshBasicMaterial({ color: 0xffd9e3 })
      const imgMesh = new THREE.Mesh(new THREE.PlaneGeometry(IMG, IMG), imgMat)
      imgMesh.userData.card = card
      card.add(imgMesh)
      card.userData.imgMesh = imgMesh
      card.userData.imgMat = imgMat

      group.add(card)
      cards.push(card)
      cardMeshes.push(imgMesh)

      loadTexture(asset(src), `รูปที่ ${i + 1}`, i).then(({ tex, aspect }) => {
        if (disposed) return
        imgMat.map = tex
        imgMat.color.set(0xffffff)
        imgMat.needsUpdate = true
        // ปรับสัดส่วนการ์ดตามรูป (รูปเราครอปเป็นจัตุรัสอยู่แล้ว aspect≈1)
        const w = aspect >= 1 ? IMG : IMG * aspect
        const h = aspect >= 1 ? IMG / aspect : IMG
        imgMesh.scale.set(w / IMG, h / IMG, 1)
        frame.scale.set((w + BORDER) / FRAME, (h + BORDER) / FRAME, 1)
      })
    })

    // ── interaction ──
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let selected = null
    let autoRot = !reduced

    let dragging = false
    let moved = 0
    let lastX = 0
    let lastY = 0
    let velY = 0

    // pinch
    let pinchStart = 0
    const pointers = new Map()

    const dom = renderer.domElement

    const onDown = (e) => {
      dom.setPointerCapture?.(e.pointerId)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y)
      } else {
        dragging = true
        moved = 0
        lastX = e.clientX
        lastY = e.clientY
      }
    }
    const onMove = (e) => {
      if (pointers.has(e.pointerId))
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchStart) {
          const delta = (pinchStart - d) * 0.01
          camera.position.z = THREE.MathUtils.clamp(
            camera.position.z + delta,
            4,
            9
          )
          pinchStart = d
        }
        return
      }

      if (!dragging || selected) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      moved += Math.abs(dx) + Math.abs(dy)
      group.rotation.y += dx * 0.008
      group.rotation.x = THREE.MathUtils.clamp(
        group.rotation.x + dy * 0.006,
        -0.6,
        0.6
      )
      velY = dx * 0.008
      lastX = e.clientX
      lastY = e.clientY
    }
    const onUp = (e) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinchStart = 0
      if (!dragging) return
      dragging = false
      if (moved < 8) {
        handleTap(e)
      }
    }

    const handleTap = (e) => {
      const rect = dom.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.intersectObjects(cardMeshes, false)[0]

      if (selected) {
        // แตะที่ไหนก็คืนกลับ
        deselect()
        return
      }
      if (hit) {
        select(hit.object.userData.card)
        setHint(false)
      }
    }

    const select = (card) => {
      selected = card
      autoRot = false
      scene.attach(card) // เก็บ world transform, ย้ายมาอยู่ใต้ scene
      card.userData.selected = true
      card.userData.returning = false
      // หรี่การ์ดอื่น
      cards.forEach((c) => {
        if (c !== card) c.userData.imgMat.color.multiplyScalar(0.32)
      })
    }

    const deselect = () => {
      if (!selected) return
      const card = selected
      selected = null
      group.attach(card) // คืนเข้า group (คง world transform)
      card.userData.selected = false
      card.userData.returning = true
      cards.forEach((c) => {
        if (c.userData.imgMat.map) c.userData.imgMat.color.set(0xffffff)
        else c.userData.imgMat.color.set(0xffd9e3)
      })
    }

    dom.addEventListener('pointerdown', onDown)
    dom.addEventListener('pointermove', onMove)
    dom.addEventListener('pointerup', onUp)
    dom.addEventListener('pointercancel', onUp)
    dom.style.touchAction = 'none'

    // ── loop ──
    const tmp = new THREE.Vector3()
    const forward = new THREE.Vector3()
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)

      if (autoRot && !dragging) group.rotation.y += 0.0035
      else if (!dragging && !selected) {
        group.rotation.y += velY
        velY *= 0.94
      }
      group.rotation.x += (0 - group.rotation.x) * (selected ? 0.05 : 0.002)

      points.rotation.y += 0.0008

      // การ์ดที่ถูกเลือก → ลอยเข้าหากล้อง
      if (selected) {
        camera.getWorldDirection(forward)
        tmp.copy(camera.position).addScaledVector(forward, 2.6)
        selected.position.lerp(tmp, 0.12)
        const zoom = 2.0 / IMG // ให้การ์ดขยายเต็มจอไม่ว่าการ์ดฐานจะเล็กแค่ไหน
        selected.scale.lerp(new THREE.Vector3(zoom, zoom, zoom), 0.12)
        selected.lookAt(camera.position)
      }
      // การ์ดที่กำลังกลับ
      cards.forEach((c) => {
        if (c.userData.returning) {
          c.position.lerp(c.userData.base, 0.14)
          c.scale.lerp(new THREE.Vector3(1, 1, 1), 0.14)
          c.quaternion.slerp(new THREE.Quaternion(), 0.14)
          if (c.position.distanceTo(c.userData.base) < 0.01) {
            c.userData.returning = false
            c.position.copy(c.userData.base)
            c.scale.set(1, 1, 1)
            c.quaternion.identity()
          }
        }
      })

      renderer.render(scene, camera)
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

    // hide hint
    const hintTimer = setTimeout(() => setHint(false), 4000)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      clearTimeout(hintTimer)
      window.removeEventListener('resize', onResize)
      dom.removeEventListener('pointerdown', onDown)
      dom.removeEventListener('pointermove', onMove)
      dom.removeEventListener('pointerup', onUp)
      dom.removeEventListener('pointercancel', onUp)
      renderer.dispose()
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          if (o.material.map) o.material.map.dispose()
          o.material.dispose()
        }
      })
      heartSprite.dispose()
      if (renderer.domElement.parentNode)
        renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #f76c8a 0%, #a51f38 60%, #5c1526 100%)',
      }}
    >
      <BackButton onBack={onBack} />
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      <div
        className="pointer-events-none absolute left-0 right-0 text-center"
        style={{ top: 'calc(env(safe-area-inset-top,0px) + 70px)' }}
      >
        <h2 className="font-display text-2xl text-white drop-shadow">
          แกลเลอรีหัวใจ
        </h2>
      </div>

      {hint && (
        <div className="pointer-events-none absolute bottom-24 left-0 right-0 text-center text-sm text-white/80">
          ลากเพื่อหมุน · แตะรูปเพื่อขยาย
        </div>
      )}
    </div>
  )
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
