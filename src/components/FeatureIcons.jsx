// ไอคอน SVG วาดเองให้เข้าธีม (แทน emoji ดิบ)
const S = { fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IcJigsaw({ c = 'var(--cherry)' }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" stroke={c} {...S}>
      <path d="M10 14h9a3 3 0 116 0h9v9a3 3 0 100 6v9H23a3 3 0 10-6 0h-7V14z" fill="rgba(247,108,138,.15)" />
    </svg>
  )
}
export function IcScratch({ c = 'var(--cherry)' }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" stroke={c} {...S}>
      <rect x="9" y="12" width="30" height="24" rx="4" fill="rgba(232,185,107,.2)" />
      <path d="M15 30c4-3 6-9 11-11" stroke="var(--gold)" />
      <path d="M22 33c3-2 5-7 9-9" stroke="var(--gold)" />
    </svg>
  )
}
export function IcCalendar({ c = 'var(--cherry)' }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" stroke={c} {...S}>
      <rect x="9" y="12" width="30" height="27" rx="4" fill="rgba(247,108,138,.12)" />
      <path d="M9 20h30M16 9v6M32 9v6" />
      <path d="M24 26c-1.6-2-5-1.3-5 1.3 0 2.4 3.2 4 5 5.4 1.8-1.4 5-3 5-5.4 0-2.6-3.4-3.3-5-1.3z" fill="var(--cherry)" stroke="none" />
    </svg>
  )
}
export function IcGacha({ c = 'var(--cherry)' }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" stroke={c} {...S}>
      <circle cx="24" cy="18" r="11" fill="rgba(247,108,138,.18)" />
      <rect x="14" y="28" width="20" height="12" rx="3" fill="rgba(214,46,79,.15)" />
      <circle cx="20" cy="16" r="2.5" fill="var(--rose)" stroke="none" />
      <circle cx="28" cy="19" r="2.5" fill="var(--gold)" stroke="none" />
      <path d="M22 36h4" />
    </svg>
  )
}
export function IcLetter({ c = 'var(--cherry)' }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" stroke={c} {...S}>
      <rect x="8" y="13" width="32" height="22" rx="4" fill="rgba(255,246,242,1)" />
      <path d="M8 16l16 11 16-11" />
      <circle cx="24" cy="27" r="3" fill="var(--cherry)" stroke="none" />
    </svg>
  )
}
export function IcGallery({ c = 'var(--cherry)' }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" stroke={c} {...S}>
      <path d="M24 39s-13-8.5-13-18a7 7 0 0113-3.6A7 7 0 0137 21c0 9.5-13 18-13 18z" fill="rgba(214,46,79,.14)" />
      <circle cx="19" cy="20" r="2" fill="var(--gold)" stroke="none" />
    </svg>
  )
}
