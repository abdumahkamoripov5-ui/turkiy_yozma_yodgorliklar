import assert from 'node:assert/strict'
import { writeFile, readFile } from 'node:fs/promises'

const base = process.env.DESIGN_TEST_URL || 'http://127.0.0.1:8000/app/'
const target = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })).json()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
let sequence = 0
const pending = new Map()
const exceptions = []
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
  const entry = pending.get(message.id)
  if (!entry) return
  pending.delete(message.id)
  clearTimeout(entry.timer)
  if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
  else entry.resolve(message.result)
})
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)) }, 20000)
    pending.set(id, { resolve, reject, timer })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
async function waitFor(expression) {
  for (let attempt = 0; attempt < 180; attempt++) {
    if (await evaluate(`Boolean(${expression})`)) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Condition failed: ${expression}`)
}
async function capture(name) {
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(new URL(`../../.local/${name}.png`, import.meta.url), Buffer.from(result.data, 'base64'))
}
const report = []
async function navigate(path) {
  await command('Page.navigate', { url: new URL(path, base).href })
  await waitFor(`document.querySelector('.meros-brand')`)
}
try {
  await command('Page.enable')
  await command('Runtime.enable')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await navigate('')
  await evaluate(`localStorage.clear(); location.reload()`)
  await waitFor(`document.querySelector('.landing-hero h1')`)
  assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1)
  assert.equal(await evaluate(`document.querySelector('.landing-actions .btn-primary').getAttribute('href').endsWith('/explore')`), true)
  await capture('hybrid-home-desktop')
  for (const width of [360, 390, 1440]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 })
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `Landing overflow: ${width}`)
  }
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await capture('hybrid-home-mobile')
  await evaluate(`document.querySelector('.landing-actions .btn-primary').click()`)
  await waitFor(`document.querySelectorAll('.journey-monument').length > 0`)
  assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1)
  assert.equal(await evaluate(`document.querySelector('a[href$="/library"]') === null`), true)
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, 'Journey mobile overflow')
  await capture('hybrid-journey-mobile')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await evaluate(`scrollTo(0, document.querySelector('#stone-journey').offsetHeight * .5)`)
  await new Promise(resolve => setTimeout(resolve, 300))
  assert.match(await evaluate(`document.querySelector('.journey-world').style.transform`), /translateZ/)
  await capture('hybrid-journey-desktop')
  await evaluate(`document.querySelector('.journey-current button').click()`)
  await waitFor(`document.querySelector('.modal-body .parallel-reading')`)
  await evaluate(`document.querySelector('.modal-header>button').click()`)
  report.push('Simple landing and optional journey work on desktop and mobile; public monument opens')
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await waitFor(`document.querySelectorAll('.journey-static-list button').length > 0`)
  assert.equal(await evaluate(`document.querySelector('.journey-world') === null`), true)
  await command('Emulation.setEmulatedMedia', { features: [] })
  report.push('Reduced motion replaces the 3D scene with readable buttons')
  await navigate('words')
  await waitFor(`document.querySelectorAll('.meros-word-card h2 a').length > 0`)
  assert.equal(await evaluate(`document.querySelectorAll('.meros-word-card').length <= 3`), true)
  await evaluate(`document.querySelector('.meros-word-card h2 a').click()`)
  await waitFor(`document.querySelector('.meros-section-heading h1')`)
  await waitFor(`document.querySelector('.meros-section-heading .meros-text-link')`)
  await capture('hybrid-word-article')
  await evaluate(`document.querySelector('.meros-section-heading .meros-text-link').click()`)
  await waitFor(`location.pathname.endsWith('/login') && document.querySelector('form')`)
  assert.match(await evaluate('location.search'), /next=/)
  for (const path of ['saved', 'polls', 'submit', 'tools']) {
    await navigate(path)
    await waitFor(`location.pathname.endsWith('/login') && document.querySelector('form')`)
    assert.equal(await evaluate(`new URLSearchParams(location.search).get('next')`), '/' + path)
  }
  report.push('Guest dictionary is readable; saving, polls, submissions and research tools require an account')
  if (process.env.HYBRID_TEST_CREDENTIALS) {
    const text = await readFile(process.env.HYBRID_TEST_CREDENTIALS, 'utf8')
    const fields = Object.fromEntries(text.split(/\r?\n/).filter(line => line.includes(': ')).map(line => { const at = line.indexOf(': '); return [line.slice(0, at), line.slice(at + 2)] }))
    assert.equal(await evaluate(`(async () => { const response = await fetch('/api/v2/auth/token/', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify({ username: fields.Login, password: fields.Parol })})}); if(!response.ok) return false; const data = await response.json(); for(const [key,value] of Object.entries({access_token:data.access,refresh_token:data.refresh,username:data.username,is_staff:data.is_staff})) localStorage.setItem(key,value); return true; })()`), true)
    await navigate('words')
    await waitFor(`document.querySelector('.meros-word-card h2 a')`)
    await evaluate(`document.querySelector('.meros-word-card h2 a').click()`)
    await waitFor(`document.querySelector('.meros-save')`)
    const wordTitle = await evaluate(`document.querySelector('.meros-section-heading h1').textContent`)
    await evaluate(`document.querySelector('.meros-save').click()`)
    await navigate('saved')
    await waitFor(`document.querySelector('.meros-saved-list h2')`)
    assert.equal(await evaluate(`document.querySelector('.meros-saved-list').textContent.includes(${JSON.stringify(wordTitle)})`), true)
    await evaluate(`document.querySelector('.meros-saved-list button').click()`)
    await waitFor(`document.querySelector('.meros-empty')`)
    await evaluate(`localStorage.clear()`)
    report.push('Signed-in users can save, reopen and remove dictionary articles')
  }
  await navigate('')
  await waitFor(`document.querySelector('.landing-hero h1')`)
  for (const [lang, text] of [['en', 'Read our heritage.'], ['ru', 'Читайте наследие.'], ['uz', 'Merosni o‘qing.']]) {
    await evaluate(`(() => { const select = document.querySelector('[data-language-select]'); select.value = ${JSON.stringify(lang)}; select.dispatchEvent(new Event('change', {bubbles:true})); })()`)
    await waitFor(`document.querySelector('.landing-hero h1').textContent.includes(${JSON.stringify(text)})`)
  }
  report.push('Landing switches between Uzbek, Russian and English')
  assert.deepEqual(exceptions, [])
  await writeFile(new URL('../../.local/hybrid-qa-report.json', import.meta.url), JSON.stringify({ report, exceptions }, null, 2))
  console.log(JSON.stringify({ report, exceptions }, null, 2))
} finally {
  await command('Page.close').catch(() => {})
  socket.close()
}
