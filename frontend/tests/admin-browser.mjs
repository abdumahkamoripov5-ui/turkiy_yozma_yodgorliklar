import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'

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

try {
 await command('Page.enable'); await command('Runtime.enable'); await command('Network.enable'); await command('Network.setCacheDisabled',{cacheDisabled:true}); await command('Network.clearBrowserCookies');
 await command('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 const origin = new URL(base).origin;
 await command('Page.navigate',{url:origin+'/django-admin/login/'});
 await waitFor("document.querySelector('#id_username')");
 await capture('admin-login-desktop');
 const credentials = await readFile(new URL('../../.local/MVP_admin_kirish.txt',import.meta.url),'utf8');
 const username=credentials.match(/^Login: (.+)$/m)[1].trim(), password=credentials.match(/^Parol: (.+)$/m)[1].trim();
 await evaluate('document.querySelector("#id_username").value='+JSON.stringify(username)+';document.querySelector("#id_password").value='+JSON.stringify(password)+';document.querySelector("#login-form").requestSubmit()');
 await waitFor("document.querySelectorAll('.studio-metric').length === 4");
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await capture('admin-dashboard-desktop');
 await evaluate('document.querySelector(".studio-metric").click()');
 await waitFor("document.querySelector('#changelist')");
 await capture('admin-list-desktop');
 await command('Page.navigate',{url:origin+'/django-admin/korpus/book/add/'});
 await waitFor("document.querySelector('#book_form')");
 await capture('admin-form-desktop');
 await command('Page.navigate',{url:origin+'/django-admin/'});
 await waitFor("document.querySelector('.studio-metric')");
 await waitFor("document.readyState === 'complete' && document.querySelector('#toggle-nav-sidebar').hasAttribute('aria-expanded')");
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Admin mobile overflow');
 await capture('admin-dashboard-mobile');
 await evaluate('document.querySelector("#toggle-nav-sidebar").click()');
 await waitFor('document.querySelector("#main").classList.contains("shifted")');
 await capture('admin-menu-mobile');
 assert.deepEqual(exceptions,[]); console.log('Admin login, dashboard, content list, edit form and mobile menu passed');
} finally {await command('Page.close').catch(()=>{});socket.close()}
