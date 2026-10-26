/* Map a real line to a photograph with pointer selection, not guessed coordinates. */
(() => {
  function enhance() {
    document.querySelectorAll('textarea[name$="image_region"]').forEach(input => {
      if (input.dataset.regionReady || input.name.includes('__prefix__')) return
      input.dataset.regionReady = 'true'
      input.rows = 2
      const root = input.closest('.inline-related') || input.form
      const urlInput = root?.querySelector('input[name$="facsimile_url"]')
      const fallback = document.getElementById('id_image')
      const editor = document.createElement('div')
      editor.className = 'studio-region-editor'
      const hint = document.createElement('p')
      hint.textContent = 'Suratda satr joylashgan hududni bosib, tortib belgilang. Avval satr surati URL manzilini kiriting.'
      const frame = document.createElement('div')
      frame.className = 'studio-region-frame'
      frame.hidden = true
      const image = document.createElement('img')
      image.alt = 'Satr hududini belgilash uchun manba surati'
      image.draggable = false
      const box = document.createElement('span')
      box.className = 'studio-region-box'
      box.hidden = true
      const clear = document.createElement('button')
      clear.type = 'button'
      clear.className = 'button'
      clear.textContent = 'Belgilangan hududni tozalash'
      frame.append(image, box)
      editor.append(hint, frame, clear)
      input.after(editor)
      let start = null
      const show = region => {
        const valid = region && ['x', 'y', 'width', 'height'].every(key => typeof region[key] === 'number' && Number.isFinite(region[key]))
        box.hidden = !valid
        if (valid) Object.assign(box.style, { left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%` })
      }
      const read = () => { try { show(JSON.parse(input.value)) } catch { show(null) } }
      const write = region => {
        input.value = JSON.stringify(region)
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
        show(region)
      }
      const load = () => {
        const value = (urlInput?.value || fallback?.value || '').trim()
        if (!value) { frame.hidden = true; return }
        try {
          const address = new URL(value, location.href)
          if (!['http:', 'https:'].includes(address.protocol)) return
          image.src = address.href
          frame.hidden = false
        } catch { frame.hidden = true }
      }
      image.addEventListener('error', () => { frame.hidden = true; hint.textContent = 'Surat yuklanmadi. URL manzilini tekshiring.' })
      image.addEventListener('load', () => { frame.hidden = false; hint.textContent = 'Satr hududini rasm ustida bosib, tortib belgilang.'; read() })
      const point = event => {
        const rect = image.getBoundingClientRect()
        return { x: Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)),
                 y: Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)) }
      }
      const selection = event => {
        const end = point(event)
        const round = value => Math.round(value * 100) / 100
        const x = round(Math.min(start.x, end.x)), y = round(Math.min(start.y, end.y))
        return { x, y, width: Math.min(round(Math.abs(end.x - start.x)), round(100 - x)),
                 height: Math.min(round(Math.abs(end.y - start.y)), round(100 - y)) }
      }
      frame.addEventListener('pointerdown', event => {
        if (event.button !== 0 || !image.naturalWidth) return
        event.preventDefault()
        start = point(event)
        frame.setPointerCapture(event.pointerId)
      })
      frame.addEventListener('pointermove', event => { if (start) show(selection(event)) })
      frame.addEventListener('pointerup', event => {
        if (!start) return
        const region = selection(event)
        start = null
        if (region.width > .1 && region.height > .1) write(region)
        else read()
      })
      frame.addEventListener('pointercancel', () => { start = null; read() })
      clear.addEventListener('click', () => write({}))
      input.addEventListener('input', read)
      urlInput?.addEventListener('change', load)
      fallback?.addEventListener('change', load)
      load()
      read()
    })
  }
  document.addEventListener('DOMContentLoaded', enhance)
  document.addEventListener('formset:added', enhance)
})()
