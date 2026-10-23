document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle-nav-sidebar')
  const main = document.getElementById('main')
  const backdrop = document.querySelector('.studio-nav-backdrop')
  const mobile = window.matchMedia('(max-width: 900px)')
  if (toggle && main) {
    const sync = () => {
      const open = main.classList.contains('shifted')
      toggle.setAttribute('aria-expanded', String(open))
      if (backdrop) backdrop.hidden = !open || !mobile.matches
    }
    toggle.addEventListener('click', sync)
    backdrop?.addEventListener('click', () => toggle.click())
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && mobile.matches && main.classList.contains('shifted')) toggle.click() })
    const closeOnMobile = () => { if (mobile.matches && main.classList.contains('shifted')) toggle.click(); sync() }
    mobile.addEventListener('change', closeOnMobile)
    closeOnMobile()
  }
  document.querySelector('[data-toggle-password]')?.addEventListener('click', event => {
    const input = document.getElementById('id_password')
    const show = input.type === 'password'
    input.type = show ? 'text' : 'password'
    event.currentTarget.textContent = show ? 'Yashirish' : 'Ko‘rsatish'
    event.currentTarget.setAttribute('aria-label', show ? 'Parolni yashirish' : 'Parolni ko‘rsatish')
    event.currentTarget.setAttribute('aria-pressed', String(show))
  })
})
