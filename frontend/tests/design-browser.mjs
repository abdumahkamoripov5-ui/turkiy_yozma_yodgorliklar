import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

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
try {
  await command('Page.enable')
  await command('Runtime.enable')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await command('Page.navigate', { url: base })
  await waitFor(`document.querySelectorAll('.meros-book-card').length === 3 && document.querySelector('.relic-control')`)
  await evaluate('document.fonts.ready.then(() => true)')
  await new Promise(resolve => setTimeout(resolve, 1400))
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Desktop overflow')
  await capture('design-home-desktop')
  await evaluate(`document.querySelector('.relic-control').click()`)
  await waitFor(`document.querySelector('.relic-object').classList.contains('is-spinning')`)
  assert.equal(await evaluate(`document.querySelector('.relic-control').getAttribute('aria-pressed')`), 'true')
  await evaluate(`document.querySelector('.relic-control').click()`)
  report.push('Desktop layout and interactive 3D rotation passed')
  await waitFor(`document.querySelectorAll('.journey-monument').length >= 2`)
  await evaluate(`(() => { const node = document.querySelector('#stone-journey'); window.journeyTop = node.getBoundingClientRect().top + scrollY; window.journeyRange = node.offsetHeight - innerHeight; scrollTo({top:window.journeyTop + window.journeyRange * .01,behavior:'instant'}); })()`)
  await new Promise(resolve => setTimeout(resolve, 700))
  const initialCamera = await evaluate(`document.querySelector('.journey-world').style.transform`)
  await capture('design-journey-start')
  await evaluate(`scrollTo({top:window.journeyTop + window.journeyRange * .45,behavior:'instant'})`)
  await new Promise(resolve => setTimeout(resolve, 700))
  assert.notEqual(await evaluate(`document.querySelector('.journey-world').style.transform`), initialCamera)
  assert.equal(await evaluate(`Math.abs(document.querySelector('.journey-stage').getBoundingClientRect().top) < 2`), true, 'Journey stage must stay pinned')
  await capture('design-journey-middle')
  await evaluate(`scrollTo({top:window.journeyTop + window.journeyRange * .98,behavior:'instant'})`)
  await waitFor(`document.querySelector('.journey-stage').dataset.finished === 'true'`)
  await capture('design-journey-end')
  await evaluate(`scrollTo({top:window.journeyTop + window.journeyRange * .2,behavior:'instant'})`)
  await waitFor(`document.querySelector('.journey-stage').dataset.finished === 'false'`)
  report.push('Scroll drives the pinned 3D camera forward and backward; end state passed')
  await evaluate(`document.querySelector('.meros-library-band').scrollIntoView({behavior:'instant',block:'center'})`)
  await waitFor(`Array.from(document.querySelectorAll('.meros-book-card')).every(node => node.classList.contains('is-visible'))`)
  await new Promise(resolve => setTimeout(resolve, 1100))
  assert.notEqual(await evaluate(`document.querySelector('.reading-progress > span').style.transform`), 'scaleX(0)')
  await capture('design-library-desktop')
  report.push('Asynchronous card scroll reveal and reading progress passed')
  await evaluate(`document.querySelector('[aria-label="Dark mode"]').click()`)
  await waitFor(`document.documentElement.dataset.theme === 'dark'`)
  await capture('design-library-dark')
  await evaluate(`document.querySelector('[aria-label="Light mode"]').click()`)
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await evaluate(`scrollTo({top:0,behavior:'instant'})`)
  await new Promise(resolve => setTimeout(resolve, 500))
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Mobile overflow')
  await capture('design-home-mobile')
  await evaluate(`document.querySelector('.hamburger').click()`)
  assert.equal(await evaluate(`document.querySelector('.hamburger').getAttribute('aria-expanded')`), 'true')
  await evaluate(`document.querySelector('.hamburger').click()`)
  report.push('390px mobile layout and menu passed')
  await evaluate(`(() => { const node = document.querySelector('#stone-journey'); const top = node.getBoundingClientRect().top + scrollY; scrollTo({top:top + (node.offsetHeight-innerHeight)*.4,behavior:'instant'}); })()`)
  await new Promise(resolve => setTimeout(resolve, 500))
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Mobile journey overflow')
  await capture('design-journey-mobile')
  await command('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true })
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, '360px overflow')
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await waitFor(`!document.querySelector('.relic-control')`)
  await waitFor(`document.querySelector('.journey-static-list button') && !document.querySelector('.journey-world')`)
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.relic-levitate')).animationName`), 'none')
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.motion-reveal')).every(node => getComputedStyle(node).opacity === '1')`), true)
  report.push('Reduced motion disables animation and preserves content visibility')
  await evaluate(`document.querySelector('nav a[href$="/library"]').click()`)
  await waitFor(`location.pathname.endsWith('/library') && document.querySelectorAll('.meros-book-card').length === 3`)
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.meros-book-card')).every(node => getComputedStyle(node).opacity === '1')`), true)
  report.push('Theme switch, 360px layout and client-side library navigation passed')
  assert.deepEqual(exceptions, [])
  console.log(report.join('\n'))
  await writeFile(new URL('../../.local/design-qa-report.json', import.meta.url), JSON.stringify({ base, report, exceptions }, null, 2))
} finally {
  await command('Page.close').catch(() => {})
  socket.close()
}
