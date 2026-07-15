// สร้าง placeholder รูปแบบ gradient ชมพู เมื่อยังไม่มีไฟล์รูปจริง
// คืนค่าเป็น data-URL (SVG) พร้อม label บอกว่าต้องแทนที่ไฟล์ไหน

const PALETTES = [
  ['#ffd9e3', '#f76c8a'],
  ['#ffe4ec', '#d62e4f'],
  ['#ffe9d6', '#e8b96b'],
  ['#ffc9d8', '#f76c8a'],
  ['#ffdfe6', '#d62e4f'],
]

export function placeholderDataUrl(label = 'photo', w = 600, h = 600, seed = 0) {
  const [a, b] = PALETTES[Math.abs(seed) % PALETTES.length]
  const safe = String(label).replace(/[<>&]/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/>
        <stop offset="1" stop-color="${b}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="50%" y="46%" font-family="Mitr, sans-serif" font-size="${Math.round(w / 9)}" fill="#ffffff" opacity="0.9" text-anchor="middle">♥</text>
    <text x="50%" y="60%" font-family="Mitr, sans-serif" font-size="${Math.round(w / 24)}" fill="#7a1e33" opacity="0.75" text-anchor="middle">${safe}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// โหลดรูปจริง ถ้าล้มเหลวใช้ placeholder แทน (คืน Promise<HTMLImageElement>)
export function loadImageWithFallback(src, label, seed = 0, size = 600) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      const fb = new Image()
      fb.onload = () => resolve(fb)
      fb.src = placeholderDataUrl(label, size, size, seed)
    }
    img.src = src
  })
}
