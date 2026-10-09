import { useState } from 'react'
import { submit } from '../api'
import { useApp } from '../context/AppContext'

// [qiymat (backend kaliti), ko'rinadigan nom] — backend/korpus/models.py bilan mos
const SCRIPTS = [
  ['koktürk', "Ko'ktürk (Orxun-Enasoy)"],
  ["uyg'ur", "Uyg'ur"],
  ['arab', 'Arab'],
  ['sogd', "So'g'd"],
  ['boshqa', 'Boshqa'],
]
const CATEGORIES = [
  ['bitiglar', 'Bitik toshlar'],
  ['qollanmalar', "Qo'llanmalar"],
  ['diniy', 'Diniy matnlar'],
  ['adabiy', 'Adabiy asarlar'],
  ['boshqa', 'Boshqa'],
]

// backend/turkiy_korpus/settings.py dagi chegaralar bilan mos
const MAX_IMAGE_MB = 20
const MAX_DOC_MB = 100
const DOC_ACCEPT = '.pdf,.doc,.docx,.odt,.txt,.rtf,.xls,.xlsx,.ods,.ppt,.pptx'

function Field({ label, required, children }) {
  return (
    // <label> maydonni o'rab oladi — yozuv bosilganda maydon fokuslanadi, ekran o'quvchi nomini o'qiydi
    <label style={{ display:'block', marginBottom:'1rem' }}>
      <span style={{ display:'block', marginBottom:'0.35rem', fontSize:'0.85rem', fontWeight:500, color:'var(--text2)' }}>
        {label}{required && <span style={{ color:'#e57373' }}> *</span>}
      </span>
      {children}
    </label>
  )
}

const EMPTY_FORM = {
  title: '', year: '', location: '', script: '', category: '', language: '',
  description: '', full_text: '', transliteration: '', translation: '',
  source_info: '', author_name: '', author_email: '', author_institution: '', author_bio: '',
}

export default function Submit() {
  const { t } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [docFile, setDocFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (imageFile && imageFile.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(t('submit_image_too_big', { n: MAX_IMAGE_MB }))
      return
    }
    if (docFile && docFile.size > MAX_DOC_MB * 1024 * 1024) {
      setError(t('submit_doc_too_big', { n: MAX_DOC_MB }))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (imageFile) fd.append('image_file', imageFile)
      if (docFile) fd.append('document', docFile)
      await submit(fd)
      // Keyingi taklif uchun forma tozalanadi
      setForm(EMPTY_FORM)
      setImageFile(null)
      setDocFile(null)
      setSuccess(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setError(err.response?.data?.error || t('submit_error'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth:'600px', textAlign:'center', paddingTop:'4rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
          <h2 style={{ color:'var(--accent)', marginBottom:'1rem' }}>{t('submit_success')}</h2>
          <p style={{ color:'var(--text2)' }}>{t('submit_success_note')}</p>
          <button onClick={() => setSuccess(false)} className="btn btn-outline" style={{ marginTop:'1.5rem' }}>
            {t('submit_again')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth:'800px' }}>
        <h1 className="page-title">{t('submit_title')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'1rem', color:'var(--accent)' }}>{t('submit_section_monument')}</h3>
            <div className="grid grid-2">
              <Field label={t('submit_monument_name')} required>
                <input type="text" value={form.title} onChange={set('title')} required style={{ width:'100%' }} />
              </Field>
              <Field label={t('submit_year')} required>
                <input type="number" value={form.year} onChange={set('year')} required
                  min="-3000" max="2000" placeholder="-600" style={{ width:'100%' }} />
              </Field>
              <Field label={t('submit_location')} required>
                <input type="text" value={form.location} onChange={set('location')} required style={{ width:'100%' }} />
              </Field>
              <Field label={t('submit_script')} required>
                <select value={form.script} onChange={set('script')} required style={{ width:'100%' }}>
                  <option value="">—</option>
                  {SCRIPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label={t('submit_category')} required>
                <select value={form.category} onChange={set('category')} required style={{ width:'100%' }}>
                  <option value="">—</option>
                  {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label={t('submit_language')}>
                <input type="text" value={form.language} onChange={set('language')} placeholder="Ko'hna turkiy" style={{ width:'100%' }} />
              </Field>
            </div>
            <Field label={t('submit_description')} required>
              <textarea value={form.description} onChange={set('description')} required minLength={30} rows={3}
                style={{ width:'100%', resize:'vertical' }} />
            </Field>
          </div>

          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'1rem', color:'var(--accent)' }}>{t('submit_section_text')}</h3>
            <Field label={t('submit_full_text')}>
              <textarea value={form.full_text} onChange={set('full_text')} rows={5}
                style={{ width:'100%', resize:'vertical', fontFamily:'serif' }} />
            </Field>
            <Field label={t('submit_transliteration')}>
              <textarea value={form.transliteration} onChange={set('transliteration')} rows={4}
                style={{ width:'100%', resize:'vertical', fontFamily:'monospace' }} />
            </Field>
            <Field label={t('submit_translation')}>
              <textarea value={form.translation} onChange={set('translation')} rows={4}
                style={{ width:'100%', resize:'vertical' }} />
            </Field>
            <Field label={t('submit_source_info')}>
              <input type="text" value={form.source_info} onChange={set('source_info')} style={{ width:'100%' }} />
            </Field>
          </div>

          {/* File uploads */}
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'1rem', color:'var(--accent)' }}>{t('submit_section_files')}</h3>
            <div className="grid grid-2">
              <Field label={t('submit_image')}>
                <input type="file" accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  style={{ width:'100%', padding:'0.4rem' }} />
                {imageFile && <p style={{ fontSize:'0.8rem', color:'var(--text2)', marginTop:'0.25rem' }}>{imageFile.name}</p>}
              </Field>
              <Field label={`${t('submit_document')} (PDF, Word, ...)`}>
                <input type="file" accept={DOC_ACCEPT}
                  onChange={e => setDocFile(e.target.files[0])}
                  style={{ width:'100%', padding:'0.4rem' }} />
                {docFile && <p style={{ fontSize:'0.8rem', color:'var(--text2)', marginTop:'0.25rem' }}>{docFile.name}</p>}
              </Field>
            </div>
          </div>

          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'1rem', color:'var(--accent)' }}>{t('submit_section_author')}</h3>
            <div className="grid grid-2">
              <Field label={t('submit_author_name')} required>
                <input type="text" value={form.author_name} onChange={set('author_name')} required style={{ width:'100%' }} />
              </Field>
              <Field label={t('submit_author_email')} required>
                <input type="email" value={form.author_email} onChange={set('author_email')} required style={{ width:'100%' }} />
              </Field>
              <Field label={t('submit_author_institution')}>
                <input type="text" value={form.author_institution} onChange={set('author_institution')} style={{ width:'100%' }} />
              </Field>
            </div>
            <Field label={t('submit_author_bio')}>
              <textarea value={form.author_bio} onChange={set('author_bio')} rows={3}
                style={{ width:'100%', resize:'vertical' }} />
            </Field>
          </div>

          {error && (
            <div role="alert" style={{ color:'#e57373', padding:'0.75rem 1rem', background:'rgba(229,115,115,0.1)',
              border:'1px solid rgba(229,115,115,0.3)', borderRadius:'var(--radius)', marginBottom:'1rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ fontSize:'1rem', padding:'0.75rem 2.5rem', width:'100%' }}>
            {loading ? t('loading') : t('submit_send')}
          </button>
        </form>
      </div>
    </div>
  )
}
