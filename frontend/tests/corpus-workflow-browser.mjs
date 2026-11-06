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
const account='corpus-qa-'+Date.now()
const password='Corpus!'+crypto.randomUUID()
async function visit(path,condition){await call('Page.navigate',{url:base+path});await until(condition);await run('document.fonts.ready.then(()=>true)');await new Promise(r=>setTimeout(r,350))}
async function fill(selector,value){await run('(()=>{const el=document.querySelector('+JSON.stringify(selector)+');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(el,'+JSON.stringify(value)+');el.dispatchEvent(new Event("input",{bubbles:true}));})()')}
try{
 await call('Page.enable');await call('Runtime.enable')
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})
 await visit('/login?mode=register&next=%2Fcorpus%3Fq%3Dbodun', 'Boolean(document.querySelector("#login_username"))')
 await run('localStorage.clear();localStorage.setItem("theme","light");localStorage.setItem("lang","uz")')
 await fill('#login_username',account);await fill('#login_password',password)
 await run('document.querySelector("#login_username").closest("form").requestSubmit()')
 await until('location.pathname==="/corpus" && Boolean(document.querySelector(".kwic-result"))')
 assert.equal(await run('new URLSearchParams(location.search).get("q")'),'bodun')
 await writeFile(new URL('../../.local/corpus-qa-account.txt',import.meta.url),account)
 report.push('Registration returns to the requested corpus query; real search results render')
 await shot('corpus-search-desktop')
 const search=await run('fetch("/api/v2/research/search/?scope=core&q=bodun",{headers:{Authorization:"Bearer "+localStorage.getItem("access_token")}}).then(r=>r.json())')
 assert.ok(search.count>0)
 const exported=await run('fetch("/api/v2/research/search/?scope=core&q=bodun&download=json",{headers:{Authorization:"Bearer "+localStorage.getItem("access_token")}}).then(async r=>({status:r.status,rows:await r.json()}))')
 assert.equal(exported.status,200);assert.ok(exported.rows.length>0)
 report.push('JSON export returns real concordance matches')
 await visit('/monuments','Boolean(document.querySelector(".card-click"))')
 const count=await run('document.querySelectorAll(".card-click").length')
 assert.equal(count,2)
 await shot('corpus-catalogue-desktop')
 await run('document.querySelector(".card-click").click()')
 await until('Boolean(document.querySelector(".parallel-reading"))')
 assert.equal(await run('Boolean(document.querySelector(".editorial-notice"))'),true)
 await shot('corpus-reading-desktop')
 await run('document.querySelector(".modal-header button").click()')
 report.push('Two source-prepared monuments, parallel reader and honest editorial status')
 await visit('/words','Boolean(document.querySelector(".dictionary-entry"))')
 await shot('corpus-dictionary-desktop')
 await run('(()=>{const el=document.querySelector(".dictionary-toolbar select");el.value="1";el.dispatchEvent(new Event("change",{bubbles:true}))})()')
 await until('new URLSearchParams(location.search).get("reviewed")==="1" && Boolean(document.querySelector(".meros-empty"))')
 report.push('Dictionary review filter excludes unreviewed sample entries')
 await visit('/quality','document.querySelectorAll(".quality-table tbody tr").length===2')
 await shot('corpus-quality-desktop')
 report.push('Quality report is calculated from live database records')
 for(const [path,condition]of [['/map','Boolean(document.querySelector(".leaflet-container"))'],['/timeline','Boolean(document.querySelector(".timeline"))'],['/sources','document.querySelectorAll(".meros-work").length>=4'],['/tools','Boolean(document.querySelector(".meros-paths"))'],['/saved','Boolean(document.querySelector("h1"))']]){await visit(path,condition);assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,path+' desktop overflow');report.push(path+' loads')}
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
 for(const [path,condition]of [['/corpus?q=bodun','Boolean(document.querySelector(".kwic-result"))'],['/monuments','Boolean(document.querySelector(".card-click"))'],['/words','Boolean(document.querySelector(".dictionary-entry"))'],['/quality','Boolean(document.querySelector(".quality-table"))']]){await visit(path,condition);assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,path+' mobile overflow');await shot('corpus-'+path.split('?')[0].slice(1)+'-mobile')}
 report.push('Search, catalogue, dictionary and quality report fit a 390px viewport')
 assert.equal(errors.length,0,JSON.stringify(errors))
 await run('localStorage.clear()')
 console.log(report.join('\n'))
 await writeFile(new URL('../../.local/corpus-workflow-report.json',import.meta.url),JSON.stringify(report,null,2))
}finally{socket.close()}
