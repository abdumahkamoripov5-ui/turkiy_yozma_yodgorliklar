// Generates and removes a diagnostic WebM, then verifies actual browser playback.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const pythonExecutable = fileURLToPath(new URL(process.platform === 'win32' ? '../../.venv/Scripts/python.exe' : '../../.venv/bin/python', import.meta.url))
const python = code => execFileSync(pythonExecutable, ['-c', code], {
  cwd: `${root}/backend`, env: { ...process.env, DJANGO_DEBUG: 'True', DJANGO_SETTINGS_MODULE: 'turkiy_korpus.settings' }, encoding: 'utf8',
}).trim()
const target = await (await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' })).json()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
let id = 0
const pending = new Map()
socket.addEventListener('message', event => {
  const msg = JSON.parse(event.data)
  const item = pending.get(msg.id)
  if (item) { clearTimeout(item.timer); pending.delete(msg.id); msg.error ? item.reject(new Error(JSON.stringify(msg.error))) : item.resolve(msg.result) }
})
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const key = ++id
    const timer = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 20000)
    pending.set(key, { resolve, reject, timer }); socket.send(JSON.stringify({ id: key, method, params }))
  })
}
async function evaluate(expression) {
  const value = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails))
  return value.result.value
}
let lessonId = null
try {
  await command('Page.enable'); await command('Runtime.enable')
  const encoded = await evaluate(`new Promise(async resolve => {
    const canvas = document.createElement('canvas'); canvas.width=320; canvas.height=180;
    const ctx=canvas.getContext('2d'); let step=0;
    const draw=()=>{ ctx.fillStyle='#22594b'; ctx.fillRect(0,0,320,180); ctx.fillStyle='#f4efdf'; ctx.font='22px sans-serif'; ctx.fillText('MVP player test',55,85); ctx.fillRect(20,135,Math.min(step++*5,280),6); };
    draw(); const stream=canvas.captureStream(10); const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'}); const chunks=[];
    recorder.ondataavailable=event=>chunks.push(event.data); recorder.onstop=async()=>{const blob=new Blob(chunks,{type:'video/webm'}); const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob);stream.getTracks().forEach(track=>track.stop());};
    recorder.start(); const timer=setInterval(draw,100); setTimeout(()=>{clearInterval(timer);recorder.stop();},1800);
  })`)
  const path = fileURLToPath(new URL('../../.local/player-test.webm', import.meta.url))
  await writeFile(path, Buffer.from(encoded, 'base64'))
  lessonId = Number(python(`import django; django.setup(); from pathlib import Path; from django.core.files.base import ContentFile; from korpus.models import MediaLesson; obj=MediaLesson.objects.create(title='MVP diagnostic player',description='Temporary browser fixture',audience='children',published=True,is_sample=True); obj.video.save('player-test.webm',ContentFile(Path(${JSON.stringify(path)}).read_bytes())); print(obj.pk)`))
  await command('Page.navigate', { url: `http://127.0.0.1:8000/app/learn/${lessonId}` })
  let ready = false
  for (let attempt = 0; attempt < 120; attempt++) {
    if (await evaluate(`!!document.querySelector('video') && document.querySelector('video').readyState >= 2`)) { ready = true; break }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert.ok(ready, 'Local uploaded video should load')
  await evaluate(`(async()=>{const video=document.querySelector('video');video.muted=true;await video.play();return true;})()`)
  await new Promise(resolve => setTimeout(resolve, 800))
  const result = await evaluate(`(()=>{const v=document.querySelector('video');v.pause();return {played:v.currentTime>0,local:v.currentSrc.includes('/media/library/'),insideSite:location.pathname.includes('/app/learn/')};})()`)
  assert.deepEqual(result, { played: true, local: true, insideSite: true })
  console.log('Video: uploaded WebM loads and plays inside the site; no external navigation.')
} finally {
  if (lessonId) python(`import django; django.setup(); from korpus.models import MediaLesson; obj=MediaLesson.objects.get(pk=${lessonId},title='MVP diagnostic player'); obj.video.delete(save=False); obj.delete()`)
  socket.close()
}
