import axios from 'axios'

// Production'da (Vercel) Render API manzili VITE_API_URL orqali beriladi.
// Lokal dev'da bo'sh qoladi — vite proxy /api'ni 127.0.0.1:8000 ga yo'naltiradi.
const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const BASE = `${API_ROOT}/api/v2`

const api = axios.create({ baseURL: BASE, timeout: 30000 })

// JWT token interceptor
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

let refreshRequest = null

// Concurrent 401 responses share one refresh so token rotation cannot race.
// Auto-refresh on 401
api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config
    if (!orig) return Promise.reject(err)
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          if (!refreshRequest) {
            refreshRequest = axios.post(`${BASE}/auth/token/refresh/`, { refresh }, { timeout: 30000 })
              .then(({ data }) => {
                localStorage.setItem('access_token', data.access)
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
                return data.access
              }).finally(() => { refreshRequest = null })
          }
          const access = await refreshRequest
          orig.headers.Authorization = `Bearer ${access}`
          return api(orig)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('username')
          localStorage.removeItem('is_staff')
          window.dispatchEvent(new Event('auth-expired'))
        }
      }
    }

    // Render'ning bepul tarifida server uyquda bo'lsa, birinchi so'rov
    // ulanish xatosi bilan tugaydi — qisqa kutib avtomatik qayta uriniladi.
    // Faqat GET (idempotent): POST (taklif yuborish) qayta yuborilsa, server
    // so'rovni aslida qabul qilgan bo'lsa, dublikat yozuv yaratilardi.
    const isNetworkError = !err.response
    orig._retryCount = orig._retryCount || 0
    if (isNetworkError && orig.method === 'get' && orig._retryCount < 2) {
      orig._retryCount += 1
      await new Promise(res => setTimeout(res, 1500 * orig._retryCount))
      return api(orig)
    }

    return Promise.reject(err)
  }
)

export default api

export const monuments = {
  async all(params = {}) {
    const items = []
    let page = 1
    let more = true
    while (more) {
      const { data } = await api.get('/monuments/', { params: { ...params, page_size: 200, page } })
      items.push(...(data.results || data))
      more = Boolean(data.next)
      page += 1
    }
    return { data: items }
  },
  list: params => api.get('/monuments/', { params }),
  // countView=false — ko'rishlar soni oshirilmaydi (?noview=1)
  get: (id, { countView = true } = {}) =>
    api.get(`/monuments/${id}/`, { params: countView ? undefined : { noview: 1 } }),
  featured: () => api.get('/monuments/featured/'),
  stats: () => api.get('/monuments/stats/'),
  concordance: q => api.get('/monuments/concordance/', { params: { q } }),
  wordFrequency: limit => api.get('/monuments/word-frequency/', { params: { limit } }),
}

export const auth = {
  login: (username, password) => api.post('/auth/token/', { username, password }),
  refresh: refresh => api.post('/auth/token/refresh/', { refresh }),
}

export const submit = formData => api.post('/submit/', formData)

export const settings = () => api.get('/settings/')

export const exportData = fmt => api.get(`/export/?format=${fmt}`, {
  responseType: fmt === 'csv' ? 'blob' : 'json',
})
