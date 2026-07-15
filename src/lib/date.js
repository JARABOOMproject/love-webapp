// คำนวณจำนวนวัน + แตกเป็น ปี/เดือน/วัน อิง timezone Asia/Bangkok (UTC+7)

// แปลง Date → ส่วนประกอบวันที่ตามเวลาไทย
function bangkokParts(d = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [y, m, day] = fmt.format(d).split('-').map(Number)
  return { y, m, day }
}

// วันนี้ (ตามเวลาไทย) เป็น Date เที่ยงคืน UTC เพื่อคำนวณผลต่างวันแบบเสถียร
function toUTCDate({ y, m, day }) {
  return Date.UTC(y, m - 1, day)
}

export function daysSince(anniversaryISO) {
  const [y, m, d] = anniversaryISO.split('-').map(Number)
  const start = Date.UTC(y, m - 1, d)
  const today = toUTCDate(bangkokParts())
  const diff = Math.floor((today - start) / 86400000)
  return Math.max(0, diff)
}

// แตกเป็น ปี เดือน วัน (แบบปฏิทิน)
export function breakdown(anniversaryISO) {
  const [sy, sm, sd] = anniversaryISO.split('-').map(Number)
  const { y: ny, m: nm, day: nd } = bangkokParts()

  let years = ny - sy
  let months = nm - sm
  let days = nd - sd

  if (days < 0) {
    months -= 1
    // จำนวนวันของเดือนก่อนหน้า (เดือนปัจจุบัน - 1)
    const prevMonthDays = new Date(ny, nm - 1, 0).getDate()
    days += prevMonthDays
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) }
}

// แตกเป็น "ปีเต็ม + วันที่เหลือ" (เช่น 2 ปี 296 วัน)
export function yearsAndDays(anniversaryISO) {
  const [sy, sm, sd] = anniversaryISO.split('-').map(Number)
  const { y: ny, m: nm, day: nd } = bangkokParts()

  // หาจำนวนปีเต็มที่ผ่านมา
  let years = ny - sy
  // ถ้ายังไม่ถึงวันครบรอบของปีนี้ ให้ลดลง 1
  if (nm < sm || (nm === sm && nd < sd)) years -= 1
  years = Math.max(0, years)

  // วันครบรอบล่าสุด (start + years ปี)
  const lastAnniv = Date.UTC(sy + years, sm - 1, sd)
  const today = Date.UTC(ny, nm - 1, nd)
  const days = Math.max(0, Math.floor((today - lastAnniv) / 86400000))

  return { years, days }
}

export function todayBangkok() {
  return bangkokParts()
}

export const TH_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
export const TH_DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
