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

async function assertSelectTextFits() {
  const clipped = await evaluate(`Array.from(document.querySelectorAll('select:not([multiple])'))
    .filter(node => node.getBoundingClientRect().height > 0)
    .filter(node => {
      const style = getComputedStyle(node);
      const available = node.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      return available + 1 < parseFloat(style.lineHeight);
    }).map(node => node.name)`);
  assert.deepEqual(clipped, [], 'Select text is clipped by the control height');
}

async function clickVisible(selector) {
  const point = await evaluate(`(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) return null;
    node.scrollIntoView({block:'center', behavior:'instant'});
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const target = document.elementFromPoint(x, y);
    return {x, y, visible: style.display !== 'none' && style.visibility !== 'hidden'
      && rect.width > 0 && rect.height > 0 && x >= 0 && x < innerWidth && y >= 0 && y < innerHeight
      && (target === node || node.contains(target))};
  })()`)
  assert.equal(point?.visible, true, `Control is hidden or obstructed: ${selector}`)
  await command('Input.dispatchMouseEvent', {type:'mousePressed', x:point.x, y:point.y, button:'left', clickCount:1})
  await command('Input.dispatchMouseEvent', {type:'mouseReleased', x:point.x, y:point.y, button:'left', clickCount:1})
}

try {
 await command('Page.enable'); await command('Runtime.enable'); await command('Network.enable'); await command('Network.setCacheDisabled',{cacheDisabled:true}); await command('Network.clearBrowserCookies');
 await command('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 const origin = new URL(base).origin;
 await command('Page.navigate',{url:origin+'/django-admin/login/'});
 await waitFor("document.querySelector('#id_username')");
 await capture('admin-login-desktop');
 const credentials = await readFile(process.env.ADMIN_TEST_CREDENTIALS || new URL('../../.local/MVP_admin_kirish.txt',import.meta.url),'utf8');
 const username=credentials.match(/^Login: (.+)$/m)[1].trim(), password=credentials.match(/^Parol: (.+)$/m)[1].trim();
 await evaluate('document.querySelector("#id_username").value='+JSON.stringify(username)+';document.querySelector("#id_password").value='+JSON.stringify(password)+';document.querySelector("#login-form").requestSubmit()');
 await waitFor("document.querySelectorAll('.studio-metric').length === 3");
 assert.equal(await evaluate(`document.querySelector('.studio-welcome') === null`),true);
 assert.equal(await evaluate(`document.querySelector('.studio-extra-nav').open`),false);
 assert.equal(await evaluate(`document.querySelectorAll('#nav-sidebar > .studio-nav-group th a').length`),4);
 assert.equal(await evaluate(`document.querySelector('#nav-sidebar a[href$="/book/"]') === null`),true);
 assert.equal(await evaluate(`Array.from(document.querySelectorAll('.studio-nav-add')).every(node => node.textContent === 'Qo‘shish')`),true);
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await capture('admin-dashboard-desktop');
 await evaluate('document.querySelector(".studio-metric").click()');
 await waitFor("document.querySelector('#changelist')");
 await capture('admin-list-desktop');
 await command('Page.navigate',{url:origin+'/django-admin/korpus/wordentry/add/'});
 await waitFor("document.querySelector('#wordentry_form')");
 await waitFor("document.readyState === 'complete'");
 await waitFor(`document.querySelector('[data-equivalent-rows] select')`);
 await assertSelectTextFits();
 assert.equal(await evaluate(`document.querySelector('textarea[name="equivalents"]') === null`),true);
 await evaluate(`document.querySelector('[data-equivalent-rows] select').value='tr'; document.querySelector('[data-equivalent-rows] input').value='el'`);
 await clickVisible('[data-add-equivalent]');
 assert.equal(await evaluate(`document.querySelectorAll('[data-equivalent-rows] tr').length`),2);
 await clickVisible('[data-equivalent-rows] tr:last-child [data-remove-equivalent]');
 assert.equal(await evaluate(`document.querySelectorAll('[data-equivalent-rows] tr').length`),1);
 assert.equal(await evaluate(`document.querySelector('[data-equivalent-rows] input').value`),'el');
 await capture('admin-form-desktop');
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await evaluate(`document.querySelector('[data-equivalents]').scrollIntoView({block:'center',behavior:'instant'})`);
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Word form mobile overflow');
 await assertSelectTextFits();
 await capture('admin-word-form-mobile');
 await command('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await command('Page.navigate',{url:origin+'/django-admin/korpus/monument/add/'});
 await waitFor(`document.querySelector('#monument_form')`);
 for (const name of ['researchers','bibliography','tags']) assert.equal(await evaluate(`document.querySelector('#id_${name}').value`),'');
 await command('Page.navigate',{url:origin+'/django-admin/'});
 await waitFor("document.querySelector('.studio-metric')");
 await waitFor("document.readyState === 'complete' && document.querySelector('#toggle-nav-sidebar').hasAttribute('aria-expanded')");
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Admin mobile overflow');
 await capture('admin-dashboard-mobile');
 await clickVisible('#toggle-nav-sidebar');
 await waitFor('document.querySelector("#main").classList.contains("shifted")');
 await waitFor(`getComputedStyle(document.querySelector('#nav-sidebar')).visibility === 'visible'`);
 await waitFor(`document.querySelector('#nav-sidebar').getBoundingClientRect().left >= 0`);
 assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#nav-sidebar')).display`), 'none');
 await capture('admin-menu-mobile');
 await clickVisible('#nav-sidebar a[href$="/korpus/wordentry/"]');
 await waitFor(`location.pathname.endsWith('/wordentry/') && document.querySelector('#changelist')`);
 await clickVisible('#toggle-nav-sidebar');
 await waitFor(`document.querySelector('#main').classList.contains('shifted')`);
 await clickVisible('#toggle-nav-sidebar');
 await waitFor(`!document.querySelector('#main').classList.contains('shifted')`);
 await command('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await command('Page.navigate',{url:origin+'/django-admin/'});
 await waitFor(`document.querySelector('.studio-extra-nav')`);
 await waitFor(`document.readyState === 'complete' && document.querySelector('#toggle-nav-sidebar').hasAttribute('aria-expanded')`);
 if (!await evaluate(`document.querySelector('#main').classList.contains('shifted')`)) await clickVisible('#toggle-nav-sidebar');
 await waitFor(`getComputedStyle(document.querySelector('#nav-sidebar')).visibility === 'visible' && document.querySelector('#nav-sidebar').getBoundingClientRect().left >= 0`);
 await clickVisible('.studio-extra-nav summary');
 await clickVisible('#nav-sidebar a[href$="/auth/user/"]');
 await waitFor(`location.pathname.endsWith('/auth/user/') && document.querySelector('#changelist')`);
 assert.equal(await evaluate(`document.querySelector('.studio-extra-nav').open`),true);
 await command('Page.navigate',{url:origin+'/django-admin/korpus/useractivity/report/?report=month'});
 await waitFor(`document.querySelector('.studio-analytics')`);
 assert.equal(await evaluate(`document.querySelectorAll('.studio-analytics-cards > div').length`),6);
 assert.equal(await evaluate(`document.querySelectorAll('.studio-analytics-chart > div').length`),30);
 await capture('analytics-report-desktop');
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Analytics mobile overflow');
 await capture('analytics-report-mobile');
 await clickVisible('.studio-report-tabs a[href="?report=week"]');
 await waitFor(`document.querySelectorAll('.studio-analytics-chart > div').length === 7`);
 await evaluate(`document.documentElement.setAttribute('data-theme','dark')`);
 await capture('analytics-report-dark-mobile');
 assert.deepEqual(exceptions,[]); console.log('Admin login, dashboard, content list, edit form, mobile menu and daily/weekly/monthly analytics passed');
} finally {await command('Page.close').catch(()=>{});socket.close()}
