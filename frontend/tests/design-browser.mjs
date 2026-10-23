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
  await waitFor(`document.querySelectorAll('.meros-book-card').length === 3 && document.querySelectorAll('.journey-monument').length >= 2`)
  await evaluate('document.fonts.ready.then(() => true)')
  await new Promise(resolve => setTimeout(resolve, 1400))
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Desktop overflow')
  await capture('design-home-desktop')
  assert.equal(await evaluate(`document.querySelector('.meros-home').firstElementChild.id`), 'stone-journey')
  assert.equal(await evaluate(`document.querySelectorAll('h1').length`), 1)
  assert.equal(await evaluate(`document.querySelector('.journey-search input').getBoundingClientRect().bottom < innerHeight`), true)
  report.push('Journey is the first homepage section, with one H1 and visible search')
  await waitFor(`document.querySelectorAll('.journey-monument').length >= 2`)
  await evaluate(`(() => { const node = document.querySelector('#stone-journey'); const stage = document.querySelector('.journey-stage'); window.journeyTop = node.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top); window.journeyRange = node.offsetHeight - stage.offsetHeight; scrollTo({top:window.journeyTop + window.journeyRange * .01,behavior:'instant'}); })()`)
  await new Promise(resolve => setTimeout(resolve, 700))
  const initialCamera = await evaluate(`document.querySelector('.journey-world').style.transform`)
  await capture('design-journey-start')
  await evaluate(`scrollTo({top:window.journeyTop + window.journeyRange * .45,behavior:'instant'})`)
  await new Promise(resolve => setTimeout(resolve, 700))
  assert.notEqual(await evaluate(`document.querySelector('.journey-world').style.transform`), initialCamera)
  assert.equal(await evaluate(`(() => { const node = document.querySelector('.journey-stage'); return Math.abs(node.getBoundingClientRect().top - parseFloat(getComputedStyle(node).top)) < 2 })()`), true, 'Journey stage must stay pinned below navigation')
  await capture('design-journey-middle')
  await evaluate(`scrollTo({top:window.journeyTop + window.journeyRange * .98,behavior:'instant'})`)
  await waitFor(`document.querySelector('.journey-stage').dataset.finished === 'true'`)
  await capture('design-journey-end')
  await evaluate(`scrollTo({top:window.journeyTop + window.journeyRange * .2,behavior:'instant'})`)
  await waitFor(`document.querySelector('.journey-stage').dataset.finished === 'false'`)
  report.push('Scroll drives the pinned 3D camera forward and backward; end state passed')
  if (process.env.DESIGN_PERF === '1') {
    await command('Performance.enable')
    await command('Emulation.setCPUThrottlingRate', { rate: 4 })
    await evaluate(`scrollTo({top:window.journeyTop + window.journeyRange * .02,behavior:'instant'})`)
    await new Promise(resolve => setTimeout(resolve, 300))
    const before = await command('Performance.getMetrics')
    const sample = await evaluate(`(async () => {
      const section = document.querySelector('#stone-journey'), stage = document.querySelector('.journey-stage');
      const originalBounds = Element.prototype.getBoundingClientRect, originalStyle = window.getComputedStyle;
      const sample = {geometryReads:0,stageAttributeWrites:0,frames:[]};
      Element.prototype.getBoundingClientRect = function(...args) { if (this === section) sample.geometryReads++; return originalBounds.apply(this,args); };
      window.getComputedStyle = function(node,...args) { if (node === stage) sample.geometryReads++; return originalStyle.call(this,node,...args); };
      const observer = new MutationObserver(records => { sample.stageAttributeWrites += records.length });
      observer.observe(stage,{attributes:true});
      let last;
      try {
        for (let index=0;index<100;index++) {
          await new Promise(resolve => requestAnimationFrame(time => { if(last) sample.frames.push(time-last); last=time; resolve(); }));
          scrollTo({top:window.journeyTop + window.journeyRange*(.03 + index/100*.85),behavior:'instant'});
        }
        await new Promise(resolve => requestAnimationFrame(resolve));
      } finally { Element.prototype.getBoundingClientRect = originalBounds; window.getComputedStyle = originalStyle; observer.disconnect(); }
      const sorted = [...sample.frames].sort((a,b)=>a-b);
      return {geometryReads:sample.geometryReads,stageAttributeWrites:sample.stageAttributeWrites,p95FrameMs:Math.round(sorted[Math.floor(sorted.length*.95)]*100)/100,frames:sample.frames.length};
    })()`)
    const after = await command('Performance.getMetrics')
    const metric = (result,name) => result.metrics.find(item => item.name === name)?.value || 0
    for (const name of ['LayoutCount','RecalcStyleCount','ScriptDuration','TaskDuration']) sample[name] = metric(after,name)-metric(before,name)
    await command('Emulation.setCPUThrottlingRate', { rate: 1 })
    if (process.env.DESIGN_PERF_LABEL !== 'before') {
      assert.equal(sample.geometryReads, 0, 'Scroll frames must use cached scene geometry')
      assert.ok(sample.stageAttributeWrites < 10, 'Scene attributes should change only at section boundaries')
    }
    await writeFile(new URL(`../../.local/journey-performance-${process.env.DESIGN_PERF_LABEL || 'latest'}.json`, import.meta.url), JSON.stringify(sample,null,2))
    console.log('Scroll performance (4x CPU throttle):',JSON.stringify(sample))
  }
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
  await evaluate(`(() => { const node = document.querySelector('#stone-journey'); const stage = document.querySelector('.journey-stage'); const top = node.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top); scrollTo({top:top + (node.offsetHeight-stage.offsetHeight)*.4,behavior:'instant'}); })()`)
  await new Promise(resolve => setTimeout(resolve, 500))
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Mobile journey overflow')
  await capture('design-journey-mobile')
  await command('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true })
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, '360px overflow')
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await waitFor(`document.querySelector('.journey-static-list button') && !document.querySelector('.journey-world')`)
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.journey-intro')).visibility`), 'visible')
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.motion-reveal')).every(node => getComputedStyle(node).opacity === '1')`), true)
  report.push('Reduced motion disables animation and preserves content visibility')
  await evaluate(`document.querySelector('nav a[href$="/library"]').click()`)
  await waitFor(`location.pathname.endsWith('/library') && document.querySelectorAll('.meros-book-card').length === 3`)
  await waitFor(`!document.documentElement.classList.contains('immersive-home')`)
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.meros-book-card')).every(node => getComputedStyle(node).opacity === '1')`), true)
  report.push('Theme switch, 360px layout and client-side library navigation passed')
  await evaluate(`document.querySelector('nav .meros-brand').click()`)
  await waitFor(`document.querySelector('.journey-search input')`)
  await evaluate(`(() => { const input = document.querySelector('.journey-search input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Tonyuquq'); input.dispatchEvent(new Event('input',{bubbles:true})); })()`)
  await evaluate(`document.querySelector('.journey-search').requestSubmit()`)
  await waitFor(`location.pathname.endsWith('/monuments') && location.search.includes('Tonyuquq')`)
  report.push('The top hero search navigates to the filtered monument catalogue')
  await evaluate(`document.querySelector('nav .meros-brand').click()`)
  await waitFor(`document.querySelector('.journey-search input')`)
  await evaluate(`(() => { const select = document.querySelector('[data-language-select]'); select.value = 'tr'; select.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await waitFor(`document.documentElement.lang === 'tr' && document.querySelector('h1').textContent.includes('Bin yıllık miras.')`)
  assert.equal(await evaluate(`document.querySelector('.journey-search input').placeholder`), 'Hangi yazıtı arıyorsunuz?')
  await capture('design-turkish-mobile')
  await command('Page.reload')
  await waitFor(`document.documentElement.lang === 'tr' && document.querySelector('h1')?.textContent.includes('Bin yıllık miras.')`)
  await evaluate(`document.querySelector('nav a[href$="/library"]').click()`)
  await waitFor(`document.querySelector('h1')?.textContent.includes('Açık kütüphane')`)
  await evaluate(`(() => { const select = document.querySelector('[data-language-select]'); select.value = 'uz'; select.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await waitFor(`document.documentElement.lang === 'uz' && document.querySelector('h1')?.textContent.includes('Ochiq kitobxona')`)
  report.push('Turkish homepage and library, language persistence and Uzbek restoration passed')
  assert.deepEqual(exceptions, [])
  console.log(report.join('\n'))
  await writeFile(new URL('../../.local/design-qa-report.json', import.meta.url), JSON.stringify({ base, report, exceptions }, null, 2))
} finally {
  await command('Page.close').catch(() => {})
  socket.close()
}
