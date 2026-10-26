import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
const base=process.env.DESIGN_TEST_URL||'http://127.0.0.1:8003/app/'
const target=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json()
const ws=new WebSocket(target.webSocketDebuggerUrl)
await new Promise(r=>ws.addEventListener('open',r,{once:true}))
let sequence=0;const pending=new Map(),exceptions=[],requests=[]
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.text);if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);const entry=pending.get(m.id);if(entry){pending.delete(m.id);clearTimeout(entry.timer);m.error?entry.reject(new Error(JSON.stringify(m.error))):entry.resolve(m.result)}})
function command(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new Error(method))},20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function wait(expression){for(let i=0;i<180;i++){try{if(await evaluate(`Boolean(${expression})`))return}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error(expression)}
async function navigate(path){await command('Page.navigate',{url:new URL(path,base).href})}
async function fill(selector,value){await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,${JSON.stringify(value)});n.dispatchEvent(new Event('input',{bubbles:true}))})()`)}
try{
 await command('Page.enable');await command('Runtime.enable');await command('Network.enable');await command('Network.setCacheDisabled',{cacheDisabled:true});await command('Network.clearBrowserCookies');await command('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']})
 await navigate('');await wait("document.querySelector('.stone-stage')")
 await evaluate('localStorage.clear();location.reload()');await wait("document.querySelector('.stone-stage')")
 for(const width of [1440,390]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<600})
  assert.equal(await evaluate("document.querySelector('.nav-links-desktop')===null"),true)
  assert.equal(await evaluate("document.querySelector('.hamburger')===null"),true)
  assert.equal(await evaluate("document.querySelector('.landing-features')===null"),true)
  assert.equal(await evaluate("Array.from(document.querySelectorAll('a')).some(n=>/\\/(words|explore|monuments)(?:[/?#]|$)/.test(n.getAttribute('href')) )"),false)
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true)
 }
 assert.equal(requests.some(url=>/\/api\/v2\/(words|monuments)\//.test(url)),false,'Guests should not fetch protected content')
 for(const route of ['explore','monuments','words/1','tools','words']){
  await navigate(route);await wait("document.querySelector('#login_username')")
  assert.equal(await evaluate("new URLSearchParams(location.search).get('mode')"),'register')
  assert.equal(await evaluate("new URLSearchParams(location.search).get('next')"),'/'+route)
 }
 const origin=new URL(base).origin
 for(const path of ['words/','words/1/','monuments/','monuments/featured/'])assert.equal((await fetch(origin+'/api/v2/'+path)).status,401)
 await fill('#login_username','member_qa_'+Date.now())
 await fill('#login_password','qa-'+crypto.randomUUID()+'Z!')
 await evaluate("document.querySelector('#login_username').form.requestSubmit()")
 await wait(`location.pathname.split('/').filter(Boolean).join('/')===${JSON.stringify(new URL(base).pathname.split('/').filter(Boolean).join('/'))} && document.querySelector('.member-home')`)
 assert.equal(await evaluate("document.querySelector('.nav-links-desktop a[href$=\"/words\"]')!==null"),true)
 assert.equal(await evaluate("document.querySelector('.preview-notice')===null"),true)
 await wait("document.cookie.includes('meros_visitor')===false") // visitor cookie is HttpOnly
 await evaluate('new Promise(r=>setTimeout(r,1200))')
 const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
 await writeFile(new URL('../../.local/membership-registered.png',import.meta.url),Buffer.from(shot.data,'base64'))
 await evaluate("document.querySelector('.nav-controls button.btn-outline').click()")
 await wait(`document.querySelector('.stone-stage') && location.pathname.split('/').filter(Boolean).join('/')===${JSON.stringify(new URL(base).pathname.split('/').filter(Boolean).join('/'))}`)
 assert.equal(await evaluate("document.querySelector('.nav-links-desktop')===null"),true)
 assert.deepEqual(exceptions,[])
 console.log('Guest navigation, direct-link/API gate, real registration to member home, member navigation and logout to guest home passed')
}finally{await command('Page.close').catch(()=>{});ws.close()}
