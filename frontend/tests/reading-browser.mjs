// Local integration test: temporary content is removed in finally.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const base = (process.env.READING_TEST_URL || 'http://127.0.0.1:8002/app/').replace(/\/?$/, '/')
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Fixtures require a local server')
const root = fileURLToPath(new URL('../../', import.meta.url))
const pythonPath = fileURLToPath(new URL(process.platform === 'win32' ? '../../.venv/Scripts/python.exe' : '../../.venv/bin/python', import.meta.url))
const python = code => execFileSync(pythonPath, ['-c', `import django; django.setup(); ${code}`], {
  cwd: `${root}/backend`, env: { ...process.env, DJANGO_DEBUG: 'True', DJANGO_SETTINGS_MODULE: 'turkiy_korpus.settings', PYTHONIOENCODING: 'utf-8' }, encoding: 'utf8',
}).trim()
const target = await (await fetch(`${process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9333'}/json/new?about:blank`, { method: 'PUT' })).json()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
const pending = new Map()
const exceptions = []
let sequence = 0
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
  const entry = pending.get(message.id)
  if (!entry) return
  clearTimeout(entry.timer); pending.delete(message.id)
  message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result)
})
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)) }, 20000)
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
async function waitFor(expression) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (await evaluate(`Boolean(${expression})`)) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Condition failed: ${expression}`)
}
async function openFixture() {
  await command('Page.navigate', { url: `${base}monuments?search=${encodeURIComponent(title)}` })
  await waitFor("document.querySelector('.card-click')")
  await evaluate("document.querySelector('.card-click').click()")
  await waitFor("document.querySelector('.parallel-reading') && !document.querySelector('.modal-body .spinner')")
}
const title = `Parallel QA ${Date.now()}`
let fixture = null
try {
  fixture = JSON.parse(python(`import json; from korpus.models import Monument, WordEntry; m=Monument.objects.create(title=${JSON.stringify(title)},year=732,location='QA',script='koktürk',category='bitiglar',description='Temporary reading fixture',full_text='Original one\\nOriginal two',transliteration='Bilgä bodun\\nUnknownword',translation='Dono xalq\\nIkkinchi satr'); w=WordEntry.objects.create(word='Bilgä',meaning='Reading fixture meaning',source='Reading fixture dictionary',published=True); print(json.dumps([m.pk,w.pk]))`))
  await command('Page.enable'); await command('Runtime.enable')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await openFixture()
  await evaluate("localStorage.setItem('lang','uz')")
  await openFixture()
  assert.equal(await evaluate("document.querySelectorAll('.reading-line').length"), 2)
  assert.ok(await evaluate("!!document.querySelector('.reading-notice.automatic')"))
  await evaluate("document.querySelector('.reading-word').click()")
  await waitFor("document.querySelector('.reading-definition')?.textContent.includes('Reading fixture meaning')")
  assert.ok(await evaluate("document.querySelector('.reading-line').classList.contains('is-active')"))
  await evaluate("[...document.querySelectorAll('.reading-word')].find(node=>node.textContent==='Unknownword').click()")
  await waitFor("document.querySelector('.reading-definition')?.textContent.includes('avtomatik taxmin qilinmaydi')")
  await command('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true })
  assert.equal(await evaluate("document.querySelector('.modal').scrollWidth <= document.querySelector('.modal').clientWidth"), true)
  const mobile = await command('Page.captureScreenshot', { format: 'png' })
  await writeFile(new URL('../../.local/parallel-reading-mobile.png', import.meta.url), Buffer.from(mobile.data, 'base64'))
  for (const [lang, label] of [['tr', 'Paralel okuma'], ['en', 'Parallel reading'], ['ru', 'Параллельное чтение']]) {
    await evaluate(`localStorage.setItem('lang',${JSON.stringify(lang)})`)
    await openFixture()
    assert.equal(await evaluate("document.querySelector('.parallel-reading').getAttribute('aria-label')"), label)
  }
  python(`from korpus.models import MonumentLine; MonumentLine.objects.create(monument_id=${fixture[0]},position=1,label='E 1',transliteration='Bilgä',translation='Dono',source='QA edition p. 12',published=True); MonumentLine.objects.create(monument_id=${fixture[0]},position=2,original='Private draft',published=False)`)
  await openFixture()
  assert.equal(await evaluate("document.querySelectorAll('.reading-line').length"), 1)
  assert.ok(await evaluate("document.querySelector('.reading-line-source').textContent.includes('QA edition p. 12')"))
  assert.ok(await evaluate("!document.querySelector('.parallel-reading').textContent.includes('Private draft')"))
  assert.deepEqual(exceptions, [])
  console.log('Parallel reading: automatic/editorial alignment, exact word lookup, missing entries, 360px layout and all four languages passed.')
} finally {
  if (fixture) python(`from korpus.models import Monument, WordEntry; Monument.objects.filter(pk=${fixture[0]},title=${JSON.stringify(title)}).delete(); WordEntry.objects.filter(pk=${fixture[1]},source='Reading fixture dictionary').delete()`)
  await command('Page.close').catch(() => {}); socket.close()
}
