import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

// Run against a local server and an isolated Chrome debugging profile.
const base = (process.env.DESIGN_TEST_URL || 'http://127.0.0.1:8000/app/').replace(/\/?$/, '/')
const target = await (await fetch((process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9222') + '/json/new?about:blank', { method: 'PUT' })).json()
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
const routes = ['', 'monuments', 'library', 'learn', 'words', 'polls', 'research', 'saved', 'sources', 'tools', 'timeline', 'map', 'scripts', 'stats', 'concordance', 'compare', 'bibliography', 'glossary', 'recommended-words', 'frequent-words', 'submit', 'about', 'login', 'missing-page'];
const books = await (await fetch(new URL('/api/v2/books/', base))).json();
const lessons = await (await fetch(new URL('/api/v2/lessons/', base))).json();
if (books.results?.length) routes.push('library/' + books.results[0].id);
if (lessons.results?.length) routes.push('learn/' + lessons.results[0].id);
const report = [];
const failed = [];
socket.addEventListener('message', event => {
 const msg = JSON.parse(event.data);
 if (msg.method === 'Network.responseReceived') {
  const response = msg.params.response;
  if (response.status >= 400 && /\/(api|assets)\//.test(response.url)) failed.push({url:response.url,status:response.status});
 }
});
try {
 await command('Page.enable'); await command('Runtime.enable'); await command('Network.enable');
 for (const width of [1440, 360]) {
  await command('Emulation.setDeviceMetricsOverride', {width,height:900,deviceScaleFactor:1,mobile:width<500});
  for (const route of routes) {
   await command('Page.navigate',{url:base+route});
   await waitFor("document.readyState === 'complete' && document.querySelector('main h1, main h2, main .page')");
   await waitFor("!document.querySelector('main .spinner')");
   await new Promise(resolve=>setTimeout(resolve,180));
   const result=await evaluate("({title:document.querySelector('main h1, main h2')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,error:!!document.querySelector('main [role=alert]')})");
   report.push({route,width,...result});
  }
 }
 await writeFile(new URL('../../.local/site-audit-report.json',import.meta.url),JSON.stringify({report,exceptions,failed},null,2));
 console.log(JSON.stringify({pages:report.length,issues:report.filter(row=>row.overflow||row.error),exceptions,failed},null,2));
 assert.deepEqual(exceptions,[],'Browser runtime exceptions');
 assert.deepEqual(failed,[],'Failed API or asset requests');
 assert.ok(report.every(row=>!row.overflow&&!row.error),'Layout and loading errors');
} finally { await command('Page.close').catch(()=>{}); socket.close(); }
