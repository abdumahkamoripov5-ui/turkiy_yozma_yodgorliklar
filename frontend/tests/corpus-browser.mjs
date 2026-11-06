import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
const base = process.env.CORPUS_QA_URL || 'http://127.0.0.1:5173'
const target = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', {method:'PUT'})).json()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open',resolve,{once:true}))
let seq=0
const pending=new Map(), errors=[]
socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}})
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>reject(Error(method+' timed out')),20000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))})}
async function run(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function until(expression){for(let i=0;i<120;i++){try{if(await run(expression))return}catch(error){if(!/navigated|context|closed/i.test(error.message))throw error}await new Promise(r=>setTimeout(r,100))}throw Error('Missing: '+expression)}
async function shot(name){const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(new URL('../../.local/'+name+'.png',import.meta.url),Buffer.from(r.data,'base64'))}
const report=[]
try{
 await call('Page.enable');await call('Runtime.enable')
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false})
 await call('Page.navigate',{url:base})
 await until(`Boolean(document.querySelector('.corpus-home'))`)
 await run(`localStorage.clear();localStorage.setItem('theme','light')`)
 await call('Page.reload');await new Promise(r=>setTimeout(r,350))
 await until(`Boolean(document.querySelector('.corpus-home'))`)
 await run('document.fonts.ready.then(()=>true)')
 await until(`[...document.images].every(i=>i.complete)`)
 assert.equal(await run('document.querySelectorAll("h1").length'),1)
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,'desktop overflow')
 assert.equal(await run('document.querySelectorAll(".scholar-desktop a").length'),5)
 await shot('corpus-desktop')
 await run(`document.querySelector('.corpus-tabs button:last-child').click()`)
 await until(`document.querySelectorAll('.corpus-collection').length===1`)
 assert.equal(await run(`document.querySelector('.corpus-collection h3').textContent.includes('nyuquq')`),true)
 await run(`document.querySelector('.corpus-tabs button').click()`)
 report.push('Desktop home, public navigation and real collection filters')
 await run(`(()=>{const s=document.querySelector('[data-language-select]');s.value='en';s.dispatchEvent(new Event('change',{bubbles:true}))})()`)
 await until(`document.querySelector('h1').textContent.includes('Carved in stone')`)
 assert.equal(await run('document.documentElement.lang'),'en')
 report.push('English interface and document language')
 await run(`document.querySelector('.scholar-icon-button').click()`)
 await until(`document.documentElement.dataset.theme==='dark'`)
 await shot('corpus-dark')
 await run(`document.querySelector('.scholar-icon-button').click()`)
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
 await run('scrollTo(0,0)')
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,'mobile overflow')
 await shot('corpus-mobile')
 await run(`document.querySelector('.scholar-mobile-toggle').click()`)
 await until(`Boolean(document.querySelector('#mobile-navigation'))`)
 assert.equal(await run(`document.querySelector('.scholar-mobile-toggle').getAttribute('aria-expanded')`),'true')
 await run(`document.querySelector('.scholar-mobile-toggle').click()`)
 report.push('390px mobile layout, no overflow, accessible menu and dark theme')
 await call('Page.navigate',{url:base+'/guide'})
 await until(`document.querySelectorAll('.corpus-guide-section').length===5`)
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,'guide overflow')
 report.push('Five-section public research guide')
 assert.equal(errors.length,0,JSON.stringify(errors))
 await writeFile(new URL('../../.local/corpus-browser-report.json',import.meta.url),JSON.stringify(report,null,2))
 console.log(report.join('\n'))
}finally{socket.close()}
