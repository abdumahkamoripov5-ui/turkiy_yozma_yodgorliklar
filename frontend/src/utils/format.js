// Yil va asrni bir xil ko'rinishda chiqarish (barcha sahifalar uchun).
// Asr hisobi backend (korpus/models.py: century_of) bilan bir xil:
// 1–100 → 1-asr, 601–700 → 7-asr, 701–800 → 8-asr.

export function centuryOf(year) {
  if (year == null || year === '') return null
  return Math.max(1, Math.floor((Math.abs(year) - 1) / 100) + 1)
}

export function formatYear(year, t) {
  if (year == null || year === '') return '—'
  return year < 0 ? `${Math.abs(year)} ${t('era_bce')}` : String(year)
}

export function formatCentury(year, t) {
  const c = centuryOf(year)
  if (c == null) return '—'
  const label = t('century_label', { n: c })
  return year < 0 ? `${label} ${t('era_bce')}` : label
}
