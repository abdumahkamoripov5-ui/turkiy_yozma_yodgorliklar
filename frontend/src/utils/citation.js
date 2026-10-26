// Iqtibos (citation) generatori — APA, MLA va GOST formatlarida.
// Mavjud yodgorlik maydonlaridan foydalanadi: researchers, title, year, location.

const SITE_NAME = 'Turkiy Yozma Yodgorliklar Korpusi'

// researchers JSONField — matnlar ro'yxati yoki {name} obyektlari bo'lishi mumkin.
function authorsFrom(researchers) {
  if (!researchers) return []
  const arr = Array.isArray(researchers) ? researchers : [researchers]
  return arr
    .map(r => (typeof r === 'string' ? r : (r?.name || r?.author || '')))
    .map(s => String(s).trim())
    .filter(Boolean)
}

function yearStr(year) {
  if (year == null || year === '') return 'sana yo‘q'
  return year < 0 ? `${Math.abs(year)} m.a.` : String(year) // m.a. = miloddan avvalgi
}

function today() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return {
    dmy: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
    long: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  }
}

export function buildCitations(m, url) {
  const authors = authorsFrom(m.researchers)
  const y = yearStr(m.year)
  const t = today()
  const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '')
  const link = url || (typeof window !== 'undefined' ? `${window.location.origin}${base}/monuments?monument=${encodeURIComponent(m.id)}` : '')
  const title = m.title || '—'
  const authorsStr = authors.length ? authors.join(', ') + '. ' : ''

  // APA 7
  const apa = `${authorsStr}(${y}). ${title}. ${SITE_NAME}. ${t.long} sanasida ${link} dan olindi.`

  // MLA 9
  const mla = `${authorsStr}"${title}." ${SITE_NAME}, ${y}, ${link}. Murojaat: ${t.dmy}.`

  // GOST (o'zbek/rus ilmiy standart)
  const gost = `${authorsStr}${title} [Elektron resurs] // ${SITE_NAME}${m.location ? '. — ' + m.location : ''}, ${y}. — URL: ${link} (murojaat sanasi: ${t.dmy}).`

  return [
    { key: 'apa', label: 'APA', text: apa },
    { key: 'mla', label: 'MLA', text: mla },
    { key: 'gost', label: 'GOST', text: gost },
  ]
}
