// ⭐ love.config.js — หัวใจของการปรับแต่ง
// แก้ทุกอย่าง (PIN, ข้อความ, รูป, เพลง, วันที่) ที่ไฟล์นี้ที่เดียว
// ห้าม hardcode ข้อความ/รูป/เพลงใน component อื่น
//
// วิธีใส่รูป/เพลงจริง:
//   1) วางไฟล์รูปไว้ที่  public/photos/  แล้วอ้างเป็น  "/photos/ชื่อไฟล์.jpg"
//   2) วางไฟล์เพลงไว้ที่ public/music/   แล้วอ้างเป็น  "/music/ชื่อไฟล์.mp3"
//   ถ้ายังไม่ใส่รูป/เพลง แอปจะแสดง placeholder ไล่เฉดชมพูให้อัตโนมัติ

// แปลง path รูป/เพลง ให้ทำงานถูกทั้งตอน dev (/) และบน GitHub Pages (/repo/)
// ใช้ import.meta.env.BASE_URL ที่ Vite ตั้งให้ตอน build
export const asset = (p) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return base + (String(p).startsWith('/') ? p : '/' + p)
}

export const CONFIG = {
  // ── รหัสลับ ──
  pin: '220923', // PIN 6 หลัก
  pinTitle: 'ถึงคุณลลิตา', // ข้อความใหญ่บนหน้า PIN
  pinPrompt: 'ใส่รหัสของเรานะ 💕',

  // ── ชื่อ (ผู้ส่ง / ผู้รับ) ──
  coupleNames: { me: 'ธนนันท์', you: 'ลลิตา' },

  // ── หน้า Portal ──
  portal: {
    heading: 'นี่คือสิ่งที่ธนนันท์อยากบอก',
    subtitle: 'เลือกเปิดทีละอย่างนะ 💌',
    bg: '/photos/portal-bg.jpg', // รูปพื้นหลังจาง ๆ
  },

  // ── วันแรกที่รู้จักกัน (YYYY-MM-DD) ──
  anniversaryDate: '2023-09-22',

  // ── เพลงประกอบ (ใส่ได้หลายเพลง) ──
  music: [
    { title: 'เพลงของเรา', src: '/music/song1.mp3' },
    // { title: 'เพลงที่สอง', src: '/music/song2.mp3' },
  ],

  // ── 4.1 จิ๊กซอว์ ──
  jigsaw: {
    image: '/photos/41_wishing-tree.jpg',
    rows: 3,
    cols: 3,
    message:
      'ต่อเสร็จแล้วแปลว่าตั้งใจนะ\nขอบคุณที่ยังอยู่ด้วยกัน และช่วยอยู่ด้วยกันตลอดไปนะคุณลลิตา',
  },

  // ── 4.2 ขูดรูปภาพ ──
  scratch: {
    image: '/photos/jigsaw-lalita.jpg',
    message: 'ขูดเจอแล้ว… รอยยิ้มที่เราชอบที่สุด ✨',
  },

  // ── 4.4 ตู้กาชา (คำพูดจากใจ เพิ่มได้ไม่จำกัด) ──
  gacha: [
    'ขอบคุณที่อยู่ข้างกันเสมอนะ 🥰',
    'วันไหนที่เหนื่อย ให้นึกว่ามีเราคอยกอดอยู่ตรงนี้',
    'เธอคือคนที่ทำให้วันธรรมดา ๆ พิเศษขึ้นทุกวัน',
    'รักเธอมากกว่าเมื่อวาน แต่น้อยกว่าพรุ่งนี้ 💗',
    'ยิ้มของเธอคือของโปรดของเรา',
    'ไม่ว่าจะไปไหน ขอแค่ได้จับมือเธอไว้ก็พอ',
    'เธอเก่งมากแล้วนะ ภูมิใจในตัวเธอเสมอ',
    'อยากแก่ไปด้วยกันกับเธอ ช้า ๆ แต่ตลอดไป',
  ],

  // ── 4.5 ซองจดหมาย ──
  letter: {
    image: '/photos/letter-photobooth.jpg',
    text: `ถึงคุณลลิตา

ขอบคุณสำหรับทุกเวลาที่เราได้อยู่ด้วยกัน
ทุกบทสนทนา ทุกเสียงหัวเราะ ทุกเรื่องเล็ก ๆ ที่เราแชร์กัน
เราเก็บไว้ในใจหมดเลยนะ

เราไม่รู้ว่าวันข้างหน้าจะเป็นยังไง
แต่แค่ได้รู้จักคุณ ได้อยู่ตรงนี้กับคุณ ตอนนี้ก็มีความสุขมากแล้ว

ขอบคุณที่เข้ามาในทุก ๆ วันของเรานะ และช่วยอยู่ด้วยกันตลอดไปนะคุณลลิตา(เก๋)`,
  },

  // ── 4.6 แกลเลอรีหัวใจ 3D ──
  // แคปเฟรมจากคลิปความทรงจำ .webm (center-crop 512px) เรียงตามไทม์ไลน์
  // เพิ่ม/ลบ/สลับได้ตามใจ · ไฟล์ f_00–f_19.jpg ก็มีในโฟลเดอร์ เอามาเพิ่มได้
  gallery: [
    '/photos/01_naya-cafe.jpg',
    '/photos/02_phra-non.jpg',
    '/photos/03_riverside-restaurant.jpg',
    '/photos/04_shabu-infinity-buffet.jpg',
    '/photos/05_popcorn-movie-ticket.jpg',
    '/photos/06_song-extraordinary.jpg',
    '/photos/07_selfie-nangfa.jpg',
    '/photos/08_oppa-deak-korean.jpg',
    '/photos/09_shabu-tryagain.jpg',
    '/photos/10_central-ayutthaya-cinema.jpg',
    '/photos/11_khaoyai-pakchong.jpg',
    '/photos/12_tokyo-farm.jpg',
    '/photos/13_wat-ayutthaya-ticket.jpg',
    '/photos/14_shabu-taylorswift-lover.jpg',
    '/photos/15_loi-krathong.jpg',
    '/photos/16_nomsod-phranakhon.jpg',
    '/photos/17_selfie-question-sticker.jpg',
    '/photos/18_lionpark-monkey.jpg',
    '/photos/19_lionpark-crocodile.jpg',
    '/photos/20_food-temple-riverside.jpg',
    '/photos/21_tothemoon-bw.jpg',
    '/photos/22_flowerfield-taylorswift.jpg',
    '/photos/23_saraburi-cafe-pizza.jpg',
    '/photos/24_towerkarst.jpg',
    '/photos/25_cafe.jpg',
    '/photos/26_koi-pond.jpg',
    '/photos/27_wat-tham-nam.jpg',
    '/photos/28_khaongu-cavepark.jpg',
    '/photos/29_wat-klangkhlong.jpg',
    '/photos/30_ttour-ticket.jpg',
    '/photos/31_sunset-beach.jpg',
    '/photos/32_beach.jpg',
    '/photos/33_car-night.jpg',
    '/photos/34_trail-hike.jpg',
    '/photos/35_beach-mountain-trip.jpg',
    '/photos/36_cartoon-style-beach.jpg',
    '/photos/37_weeknd-ticket-confirmation.jpg',
    '/photos/38_mandarin-hotpot.jpg',
    '/photos/39_movie-ticket-final.jpg',
    '/photos/40_concert-photobooth-final.jpg',
  ],
}
