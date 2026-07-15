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

export function todayBangkok() {
  return bangkokParts()
}

export const TH_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
export const TH_DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
