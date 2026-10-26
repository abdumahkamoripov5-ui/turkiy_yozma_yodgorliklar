import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
const base=process.env.DESIGN_TEST_URL||'http://127.0.0.1:8002/app/'
const target=await(await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'})).json()
const ws=new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}))
let id=0;const pending=new Map()
ws.addEventListener('message',event=>{const data=JSON.parse(event.data);const p=pending.get(data.id);if(p){pending.delete(data.id);clearTimeout(p.timer);data.error?p.reject(new Error(JSON.stringify(data.error))):p.resolve(data.result)}})
function command(method,params={}){return new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>reject(new Error(method)),30000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}))})}
async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function wait(expression){for(let i=0;i<180;i++){try{if(await evaluate(`Boolean(${expression})`))return}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error(expression)}
try {
 await command('Page.enable');await command('Runtime.enable');await command('Network.enable');await command('Performance.enable')
 await command('Network.setCacheDisabled',{cacheDisabled:true});await command('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']})
 await command('Page.addScriptToEvaluateOnNewDocument',{source:`window.__stonePerf={draws:0,vertices:0};const original=WebGLRenderingContext.prototype.drawArrays;WebGLRenderingContext.prototype.drawArrays=function(mode,start,count){window.__stonePerf.draws++;window.__stonePerf.vertices+=count;return original.call(this,mode,start,count)}`})
 const width=Number(process.env.STONE_WIDTH||1440),height=width<800?844:1000
 await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:width<800?2:1,mobile:width<800})
 await command('Page.navigate',{url:new URL(process.env.STONE_ROUTE||'stone-preview',base).href});await wait("document.querySelector('[data-renderer=compositor]') || document.querySelector('canvas[data-renderer=webgl]') || document.querySelector('.cinema-sculpture-fallback')")
 await wait("Array.from(document.querySelectorAll('.cinema-sculpture img')).every(img=>img.complete && img.naturalWidth>0)")
 await evaluate('new Promise(r=>setTimeout(r,600))')
 const gpu=await evaluate(`(() => {const c=document.querySelector('canvas');const gl=c?.getContext('webgl');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {renderer:document.querySelector('[data-renderer=compositor]')?'CSS compositor / prelit assets':ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable',pixels:c?c.width*c.height:0}})()`)
 const idle=await evaluate(`(async()=>{const count=__stonePerf.draws;await new Promise(r=>setTimeout(r,2000));return __stonePerf.draws-count})()`)
 if(process.env.STONE_CPU_RATE)await command('Emulation.setCPUThrottlingRate',{rate:Number(process.env.STONE_CPU_RATE)})
 if(process.env.STONE_PROFILE==='1'){await command('Profiler.enable');await command('Profiler.start')}
 const before=await command('Performance.getMetrics')
 const scrollPromise=evaluate(`new Promise(resolve=>{
   const root=document.querySelector('.stone-scroll'),stage=document.querySelector('.stone-stage'),nav=document.querySelector('.navbar-blur').offsetHeight;
   const top=root.getBoundingClientRect().top+scrollY-nav,range=root.offsetHeight-stage.offsetHeight;
   const intervals=[],longTasks=[];let previous=0,start=0;const draws=__stonePerf.draws,vertices=__stonePerf.vertices;
   const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask',buffered:false});
   function tick(time){if(!start)start=time;if(previous)intervals.push(time-previous);previous=time;const p=Math.min(1,(time-start)/5500);if(${process.env.STONE_NATIVE!=='1'})scrollTo({top:top+range*p,behavior:'instant'});if(p<1){requestAnimationFrame(tick);return;}observer.disconnect();intervals.sort((a,b)=>a-b);resolve({frames:intervals.length,p50:intervals[Math.floor(intervals.length*.5)],p95:intervals[Math.floor(intervals.length*.95)],max:Math.max(...intervals),over50:intervals.filter(x=>x>50).length,longTasks:longTasks.length,draws:__stonePerf.draws-draws,vertices:__stonePerf.vertices-vertices})}requestAnimationFrame(tick);
 })`)
 if(process.env.STONE_NATIVE==='1')await command('Input.synthesizeScrollGesture',{x:width/2,y:height/2,yDistance:-3300,speed:650,gestureSourceType:width<800?'touch':'mouse'})
 const scroll=await scrollPromise
 const after=await command('Performance.getMetrics')
 if(process.env.STONE_PROFILE==='1'){
   const {profile}=await command('Profiler.stop');const counts=new Map();for(const sample of profile.samples||[])counts.set(sample,(counts.get(sample)||0)+1)
   console.log(JSON.stringify(profile.nodes.map(node=>({function:node.callFrame.functionName,url:node.callFrame.url.split('/').pop(),samples:counts.get(node.id)||0})).sort((a,b)=>b.samples-a.samples).slice(0,15)))
 }
 const metric=(r,name)=>r.metrics.find(m=>m.name===name)?.value||0
 const result={gpu,width,lightweight:await evaluate("document.querySelector('.stone-performance-lite') !== null"),idleDrawsIn2Seconds:idle,cpuRate:Number(process.env.STONE_CPU_RATE||1),...scroll,layoutCount:metric(after,'LayoutCount')-metric(before,'LayoutCount'),styleRecalculations:metric(after,'RecalcStyleCount')-metric(before,'RecalcStyleCount'),mainThreadSeconds:metric(after,'TaskDuration')-metric(before,'TaskDuration')}
 console.log(JSON.stringify(result,null,2))
 await writeFile(new URL(`../../.local/${process.env.STONE_PERF_REPORT||'stone-performance'}.json`,import.meta.url),JSON.stringify(result,null,2))
 if(process.env.STONE_PERF_ASSERT==='1'){
   assert.equal(idle,0,'An idle scene must not keep drawing WebGL frames')
   assert.ok(scroll.p95<35,`p95 frame interval is ${scroll.p95}ms`)
   assert.ok(scroll.over50<=1,`Long frames: ${scroll.over50}`)
 }
}finally{await command('Page.close').catch(()=>{});ws.close()}
