// Browser smoke test using an isolated Chrome debugging session on port 9222.
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const base = 'http://127.0.0.1:8000/app'
const target = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })).json()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
let nextId = 0
const pending = new Map()
const exceptions = []
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
  if (!message.id) return
  const entry = pending.get(message.id)
  if (!entry) return
  clearTimeout(entry.timer)
  pending.delete(message.id)
  if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
  else entry.resolve(message.result)
})
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId
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
  for (let attempt = 0; attempt < 150; attempt++) {
    if (await evaluate(expression)) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Condition failed: ${expression}`)
}
async function navigate(path, condition) {
  await command('Page.navigate', { url: `${base}${path}` })
  await waitFor(condition)
}
async function screenshot(name) {
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(new URL(`../../.local/${name}.png`, import.meta.url), Buffer.from(result.data, 'base64'))
}
async function fill(selector, value) {
  await evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) throw new Error('Input missing'); const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, ${JSON.stringify(value)}); node.dispatchEvent(new Event('input', { bubbles:true })); })()`)
}
const report = []
const username = `mvp_qa_${Date.now()}`
try {
  await mkdir(new URL('../../.local/', import.meta.url), { recursive: true })
  await command('Page.enable'); await command('Runtime.enable')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false })
  await command('Page.navigate', { url: `${base}/` })
  await waitFor(`location.pathname === '/app/' && document.readyState === 'complete'`)
  await evaluate(`localStorage.clear(); sessionStorage.clear()`)
  await navigate('/', `document.querySelectorAll('.meros-book-card').length === 3 && document.querySelectorAll('.meros-lesson-card').length === 2`)
  assert.ok(await evaluate(`document.body.innerText.includes('Ming yillik so‘z.')`))
  await screenshot('mvp-home-desktop'); report.push('Home: real API content and desktop layout')
  await evaluate(`document.querySelector('.meros-book-cover').click()`)
  await waitFor(`!!document.querySelector('.meros-reader-paper')`)
  const first = await evaluate(`document.querySelector('.meros-reader-paper h2').textContent`)
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Keyingi varoq')).click()`)
  await waitFor(`document.querySelector('.meros-reader-paper h2').textContent !== ${JSON.stringify(first)}`)
  await evaluate(`document.querySelector('.meros-reader-title .meros-save').click()`)
  await waitFor(`document.querySelector('.meros-reader-title .meros-save').getAttribute('aria-pressed') === 'true'`)
  await screenshot('mvp-reader-desktop'); report.push('Reader: page turns and bookmark')
  await navigate('/saved', `!!document.querySelector('.meros-saved-list article')`)
  report.push('Personal library: saved book persists across navigation')
  await navigate('/learn', `document.querySelectorAll('.meros-lesson-card').length === 2`)
  await evaluate(`document.querySelector('.meros-lesson-card').click()`)
  await waitFor(`!!document.querySelector('.meros-quiz input')`)
  await evaluate(`document.querySelector('.meros-quiz input').click()`)
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Javobni tekshirish')).click()`)
  await waitFor(`!!document.querySelector('.meros-quiz-result')`)
  report.push('Lesson: server evaluates quiz answer')
  await navigate('/login?next=/polls', `!!document.querySelector('#login_username')`)
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Ro‘yxatdan o‘tish')).click()`)
  await fill('#login_username', username)
  await fill('#login_password', 'Browser-QA-strong-password-73829')
  await evaluate(`document.querySelector('form').requestSubmit()`)
  await waitFor(`location.pathname.endsWith('/polls') && !!document.querySelector('.meros-poll-option input')`)
  await evaluate(`document.querySelector('.meros-poll-option input').click()`)
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Ovoz berish →')).click()`)
  await waitFor(`document.body.innerText.includes('Ovozingiz qabul qilindi')`)
  report.push('Registration + authenticated voting end to end')
  await navigate('/research', `!!document.querySelector('.meros-research-banner button')`)
  await evaluate(`document.querySelector('.meros-research-banner button').click()`)
  await fill('input[name="title"]', 'MVP brauzer tekshiruvi')
  await fill('input[name="author"]', 'QA')
  await fill('textarea[name="abstract"]', 'Moderatsiya jarayonini tekshiruvchi vaqtinchalik yozuv.')
  await evaluate(`document.querySelector('.meros-consent input').click()`)
  await evaluate(`document.querySelector('.meros-research-form').requestSubmit()`)
  await waitFor(`!!document.querySelector('.meros-work') && document.body.innerText.includes('Admin tekshiruvida')`)
  report.push('Research: submission enters private moderation queue')
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await navigate('/', `document.querySelectorAll('.meros-book-card').length === 3`)
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), 'Mobile home overflows')
  await screenshot('mvp-home-mobile')
  await evaluate(`document.querySelector('button.hamburger').click()`)
  assert.ok(await evaluate(`[...document.querySelectorAll('a')].some(a=>a.textContent==='Kitobxona' && a.getBoundingClientRect().height > 0)`))
  await navigate('/library/1', `!!document.querySelector('.meros-reader-paper')`)
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), 'Mobile reader overflows')
  await screenshot('mvp-reader-mobile'); report.push('Mobile: home, menu and reader fit 390px viewport')
  const credentials = await readFile(new URL('../../.local/MVP_admin_kirish.txt', import.meta.url), 'utf8')
  const login = credentials.match(/Login: ([^\r\n]+)\r?\nParol: ([^\r\n]+)/)
  assert.ok(login, 'Local admin credentials should exist')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false })
  await command('Page.navigate', { url: 'http://127.0.0.1:8000/django-admin/login/?next=/django-admin/' })
  await waitFor(`!!document.querySelector('#id_username')`)
  await fill('#id_username', login[1]); await fill('#id_password', login[2])
  await evaluate(`document.querySelector('#login-form').requestSubmit()`)
  await waitFor(`location.pathname === '/django-admin/' && !!document.querySelector('#content-main')`)
  await command('Page.navigate', { url: 'http://127.0.0.1:8000/django-admin/korpus/medialesson/' })
  await waitFor(`!!document.querySelector('#changelist')`)
  report.push('Admin: login and media management page render successfully')
  assert.deepEqual(exceptions, [], 'Uncaught browser exceptions')
  await writeFile(new URL('../../.local/mvp-qa-report.json', import.meta.url), JSON.stringify({ username, checks: report, exceptions }, null, 2))
  console.log(JSON.stringify({ username, checks: report, exceptions }, null, 2))
} finally {
  socket.close()
}
