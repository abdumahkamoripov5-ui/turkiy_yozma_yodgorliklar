import test from 'node:test'
import assert from 'node:assert/strict'

const values = new Map()
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
}

const { getLang, setLang, t } = await import('../src/i18n.js')

test('all seven interface languages can be selected and persisted', () => {
  for (const [language, expected] of [
    ['uz', 'Yodgorliklar'], ['ru', 'Памятники'], ['en', 'Monuments'],
    ['tr', 'Yazıtlar'], ['tg', 'Ёдгориҳо'], ['ky', 'Эстеликтер'], ['kk', 'Ескерткіштер'],
  ]) {
    setLang(language)
    assert.equal(getLang(), language)
    assert.equal(localStorage.getItem('lang'), language)
    assert.equal(t('nav_monuments'), expected)
  }
})

test('new languages include parallel reading labels and variable formatting', () => {
  setLang('kk')
  assert.equal(t('reading_title'), 'Қатар оқу')
  assert.equal(t('scripts_count', { n: 3 }), '3 ескерткіш')
})

test('unsupported language safely falls back to Uzbek', () => {
  setLang('xx')
  assert.equal(getLang(), 'uz')
  assert.equal(localStorage.getItem('lang'), 'uz')
})
