import axios from 'axios'

// Production'da (Vercel) Render API manzili VITE_API_URL orqali beriladi.
// Lokal dev'da bo'sh qoladi — vite proxy /api'ni 127.0.0.1:8000 ga yo'naltiradi.
const API_ROOT = import.meta.env.VITE_API_URL || ''
const BASE = `${API_ROOT}/api/v2`

const api = axios.create({ baseURL: BASE })

// JWT token interceptor
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-refresh on 401
api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          // ROTATE_REFRESH_TOKENS: server yangi refresh qaytaradi, eskisi bekor qilinadi
          if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
          orig.headers.Authorization = `Bearer ${data.access}`
          return api(orig)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
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
