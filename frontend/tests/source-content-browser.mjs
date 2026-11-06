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


const account='corpus-qa-'+Date.now()
try{
 await call('Page.enable');await call('Runtime.enable')
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false})
 await call('Page.navigate',{url:base})
 await until('Boolean(document.querySelector(".corpus-home"))')
 await run('localStorage.clear()')
 const registered=await run('fetch("/api/v2/auth/register/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:'+JSON.stringify(account)+',password:'+JSON.stringify('Source!'+crypto.randomUUID())+'})}).then(r=>r.json()).then(data=>{localStorage.setItem("access_token",data.access);localStorage.setItem("refresh_token",data.refresh);localStorage.setItem("username",data.username);localStorage.setItem("is_staff","false");return Boolean(data.access)})')
 assert.equal(registered,true)
 await writeFile(new URL('../../.local/corpus-qa-account.txt',import.meta.url),account)
 const records=await run('fetch("/api/v2/monuments/?scope=core",{headers:{Authorization:"Bearer "+localStorage.getItem("access_token")}}).then(r=>r.json()).then(d=>d.results)')
 assert.equal(records.length,2)
 const kt=records.find(row=>row.year===732)
 await call('Page.navigate',{url:base+'/monuments?monument='+kt.id})
 await until('document.querySelectorAll(".reading-line").length===7')
 await run('document.querySelector(".source-provenance summary").click()')
 await until('Boolean(document.querySelector(".edition-scan-grid img")?.naturalWidth)')
 assert.equal(await run('document.querySelector(".source-provenance blockquote").textContent.includes("Quand le ciel bleu")'),true)
 await shot('source-edition-reader-desktop')
 const quality=await run('fetch("/api/v2/research/quality/",{headers:{Authorization:"Bearer "+localStorage.getItem("access_token")}}).then(r=>r.json())')
 assert.equal(quality.source_prepared_lines,11);assert.equal(quality.source_prepared_words,37);assert.equal(quality.expert_reviewed_lines,0)
 const exported=await run('fetch("/api/v2/research/export/?scope=core&download=json",{headers:{Authorization:"Bearer "+localStorage.getItem("access_token")}}).then(r=>r.json())')
 assert.equal(exported.length,11);assert.equal(exported[0].provenance.original_license,'CC-BY-SA-4.0')
 const word=await run('fetch("/api/v2/words/lookup/?q='+encodeURIComponent('qapıγqa')+'&scope=core",{headers:{Authorization:"Bearer "+localStorage.getItem("access_token")}}).then(r=>r.json()).then(d=>d.results[0])')
 assert.equal(word.word,'qapıγ')
 await call('Page.navigate',{url:base+'/words/'+word.id})
 await until('Boolean(document.querySelector(".source-provenance"))')
 await run('document.querySelector(".source-provenance summary").click()')
 await until('Boolean(document.querySelector(".edition-scan-grid img")?.naturalWidth)')
 await shot('source-dictionary-entry-desktop')
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true)
 await shot('source-dictionary-entry-mobile')
 await call('Page.navigate',{url:base+'/monuments?monument='+kt.id})
 await until('document.querySelectorAll(".reading-line").length===7')
 await run('document.querySelector(".source-provenance summary").click()')
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true)
 assert.equal(errors.length,0,JSON.stringify(errors))
 await run('localStorage.clear()')
 console.log('Verified 11 source-linked passages, 37 contextual entries, real edition scans, French source excerpts, attested-form lookup, rights-preserving export and mobile layout. No expert approvals were fabricated.')
}finally{socket.close()}
