# 💌 Love Web App

เว็บแอปของขวัญสำหรับแฟน · Mobile-first · ธีม "Love Letter Atelier"

PIN Login → Portal → 6 ลูกเล่น: จิ๊กซอว์ · ขูดหัวใจ · นับวันรัก + ปฏิทิน · ตู้กาชา · ซองจดหมาย · แกลเลอรีหัวใจ 3D + เทปเพลงลอยทุกหน้า

## เริ่มใช้งาน

```bash
npm install
npm run dev      # เปิด http://localhost:5173
npm run build    # สร้างไฟล์ static ที่ dist/
npm run preview  # ดู build จริง
```

## ⭐ แก้ทุกอย่างที่ไฟล์เดียว

เปิด **`src/config/love.config.js`** แล้วแก้ได้เลย:

- `pin` — รหัส 6 หลัก
- `coupleNames` — ชื่อเรา/ชื่อแฟน
- `anniversaryDate` — วันเริ่มคบ (YYYY-MM-DD)
- `music` — รายการเพลง (ใส่ไฟล์ที่ `public/music/`)
- `jigsaw / scratch / letter / gallery` — รูป + ข้อความ
- `gacha` — คำพูดจากใจ (เพิ่มได้ไม่จำกัด)

## ใส่รูป / เพลงจริง

1. วางรูปไว้ที่ `public/photos/` เช่น `jigsaw.jpg`, `scratch.jpg`, `letter.jpg`, `g1.jpg … g12.jpg`
2. วางเพลงไว้ที่ `public/music/` เช่น `song1.mp3`
3. อ้างชื่อไฟล์ใน `love.config.js` ให้ตรง

> ยังไม่ใส่รูป/เพลงก็เปิดเล่นได้ — แอปจะแสดง **placeholder ไล่เฉดชมพู** ให้อัตโนมัติ
> รูปแนะนำ ≤ 300KB/ไฟล์ · เพลง ≤ 5MB/ไฟล์ · กำหนดสัดส่วนสี่เหลี่ยมจัตุรัสจะสวยที่สุด

## Deploy

Build เป็น static site เปิดจาก `dist/` ได้เลย — วางบน Vercel / Netlify / GitHub Pages

## Tech

Vite · React 18 · Tailwind CSS · Framer Motion · Three.js · canvas-confetti
