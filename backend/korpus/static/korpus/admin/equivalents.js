document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-equivalents]').forEach(widget => {
    const rows = widget.querySelector('[data-equivalent-rows]')
    const template = rows.querySelector('tr').cloneNode(true)
    widget.querySelector('[data-add-equivalent]').addEventListener('click', () => {
      const row = template.cloneNode(true)
      row.querySelector('select').value = ''
      row.querySelector('input').value = ''
      rows.appendChild(row)
      row.querySelector('select').focus()
    })
    rows.addEventListener('click', event => {
      if (!event.target.closest('[data-remove-equivalent]')) return
      const row = event.target.closest('tr')
      if (rows.children.length === 1) {
        row.querySelector('select').value = ''
        row.querySelector('input').value = ''
      } else row.remove()
    })
  })
})
