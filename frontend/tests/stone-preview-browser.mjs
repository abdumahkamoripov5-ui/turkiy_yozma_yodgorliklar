import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const base = process.env.DESIGN_TEST_URL || 'http://127.0.0.1:8002/app/'
const target = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })).json()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
let sequence = 0
const pending = new Map(), exceptions = []
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
  const entry = pending.get(message.id)
  if (!entry) return
  pending.delete(message.id); clearTimeout(entry.timer)
  if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
  else entry.resolve(message.result)
})
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(method)) }, 20000)
    pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
async function wait(expression) {
  for (let i = 0; i < 150; i++) {
    try { if (await evaluate(`Boolean(${expression})`)) return } catch { /* navigation */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Condition failed: ${expression}`)
}
async function screenshot(name) {
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(new URL(`../../.local/stone-preview-${name}.png`, import.meta.url), Buffer.from(result.data, 'base64'))
}
async function scrollToRatio(ratio) {
  await evaluate(`(() => { const root = document.querySelector('.stone-scroll'), stage = document.querySelector('.stone-stage'); const nav = document.querySelector('.navbar-blur').offsetHeight; scrollTo({top:root.getBoundingClientRect().top + scrollY - nav + (root.offsetHeight - stage.offsetHeight) * ${ratio},behavior:'instant'}); })()`)
  await evaluate('new Promise(resolve => setTimeout(resolve, 850))')
}

try {
  await command('Page.enable'); await command('Runtime.enable'); await command('Network.enable')
  await command('Network.setCacheDisabled', { cacheDisabled: true })
  await command('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'] })
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await command('Page.navigate', { url: new URL('stone-preview', base).href })
  await wait("document.querySelector('.stone-stage')")
  await wait("document.querySelector('[data-renderer=compositor]')")
  await wait("Array.from(document.querySelectorAll('.cinema-sculpture img')).every(img=>img.complete && img.naturalWidth>0)")
  for (const width of [1440, 390]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width < 600 })
    let initial
    for (const [label, ratio, scene] of [['start', 0, '0'], ['detail', .49, '1'], ['end', .9, '2']]) {
      await scrollToRatio(ratio)
      await wait(`document.querySelector('.stone-stage').dataset.scene === '${scene}'`)
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Overflow ${width}`)
      assert.equal(await evaluate(`(() => { const stage=document.querySelector('.stone-stage').getBoundingClientRect(); return Math.abs(stage.top - document.querySelector('.navbar-blur').offsetHeight) < 2 })()`), true, 'Scene must stay pinned')
      const transform = await evaluate("getComputedStyle(document.querySelector('.cinema-stone-rig')).transform")
      if (label === 'start') initial = transform
      else assert.notEqual(transform, initial)
      if (label === 'detail') assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('.cinema-detail-window')).opacity) > .9"))
      await screenshot(`${width}-${label}`)
      assert.equal(await evaluate(`(() => {const panel=document.querySelector('.stone-story-panel.is-active'); const a=panel.getBoundingClientRect();const b=panel.lastElementChild.getBoundingClientRect();return b.bottom <= a.bottom + 1 && a.top >= 0 && b.bottom < innerHeight})()`), true, `Story text fits ${width} ${label}`)
    }
    await scrollToRatio(0)
    await wait("document.querySelector('.stone-stage').dataset.scene === '0'")
    await evaluate("document.querySelector('.stone-stage-footer nav button:last-child').click()")
    await wait("document.querySelector('.stone-stage').dataset.scene === '2'")
  }
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await wait("document.querySelector('.stone-preview-reduced')")
  assert.equal(await evaluate("Array.from(document.querySelectorAll('.stone-story-panel')).every(node => getComputedStyle(node).visibility === 'visible')"), true)
  assert.equal(await evaluate("document.querySelectorAll('.stone-static-image').length"), 3)
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true)
  await screenshot('reduced-motion')
  await command('Emulation.setEmulatedMedia', { features: [] })
  await wait("document.querySelector('[data-renderer=compositor]')")
  assert.equal(await evaluate("document.querySelectorAll('.cinema-sculpture canvas').length"),0,'Scroll must not depend on WebGL')
  await evaluate("document.querySelector('.nav-controls a.btn-outline').click()")
  await wait("document.querySelector('#login_username')")
  assert.equal(await evaluate("document.documentElement.classList.contains('stone-cinema-open')"), false, 'Preview navigation styles must be cleaned up')
  assert.deepEqual(exceptions, [])
  console.log('Compositor scene, forward/reverse camera, chapter controls, mobile text, reduced motion, no WebGL and navigation cleanup passed')
} finally { await command('Page.close').catch(() => {}); ws.close() }
