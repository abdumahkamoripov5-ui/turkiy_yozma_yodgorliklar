import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Landing'
import StonePreview from './pages/StonePreview'
import './mvp/landing.css'
import MotionEffects from './components/MotionEffects'
import UsageTracker from './components/UsageTracker'

// Sahifalar lazy yuklanadi — leaflet (xarita) va boshqa og'ir kodlar faqat kerak bo'lganda olinadi.
const Monuments = lazy(() => import('./pages/Monuments'))
const Explore = lazy(() => import('./pages/Explore'))
const PersonalLibrary = lazy(() => import('./pages/PersonalLibrary'))
const Timeline = lazy(() => import('./pages/Timeline'))
const MapView = lazy(() => import('./pages/MapView'))
const Scripts = lazy(() => import('./pages/Scripts'))
const Stats = lazy(() => import('./pages/Stats'))
const Concordance = lazy(() => import('./pages/Concordance'))
const Compare = lazy(() => import('./pages/Compare'))
const Bibliography = lazy(() => import('./pages/Bibliography'))
const Glossary = lazy(() => import('./pages/Glossary'))
const RecommendedWords = lazy(() => import('./pages/RecommendedWords'))
const FrequentWords = lazy(() => import('./pages/FrequentWords'))
const Submit = lazy(() => import('./pages/Submit'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Polls = lazy(() => import('./pages/Polls'))
const Words = lazy(() => import('./pages/Words'))
const WordArticle = lazy(() => import('./pages/WordArticle'))
const Sources = lazy(() => import('./pages/Sources'))
const ResearchTools = lazy(() => import('./pages/ResearchTools'))

function RouteScroll() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function Layout() {
  const { theme, lang } = useApp()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = { uz: 'Turkiy Meros — matnlar va so‘zlar', ru: 'Turkiy Meros — тексты и слова', en: 'Turkiy Meros — texts and words' }[lang] || 'Turkiy Meros'
    document.querySelector('meta[name="description"]')?.setAttribute('content', { uz: 'Tarixiy matnlar, lug‘at va tadqiqot hamjamiyati. Bepul ro‘yxatdan o‘ting.', ru: 'Исторические тексты, словарь и исследовательское сообщество. Бесплатная регистрация.', en: 'Historical texts, a dictionary and a research community. Join for free.' }[lang] || 'Turkiy Meros')
  }, [lang])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <RouteScroll />
      <UsageTracker />
      <MotionEffects />
      <Navbar />
      <main>
        <Suspense fallback={<div className="page" style={{ textAlign:'center' }}>…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stone-preview" element={<StonePreview />} />
          <Route element={<RequireAuth />}>
          <Route path="/explore" element={<Explore />} />
          <Route path="/monuments" element={<Monuments />} />
          <Route path="/words" element={<Words />} />
          <Route path="/words/:id" element={<WordArticle />} />
          <Route path="/saved" element={<PersonalLibrary />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/tools" element={<ResearchTools />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/concordance" element={<Concordance />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/bibliography" element={<Bibliography />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/recommended-words" element={<RecommendedWords />} />
          <Route path="/frequent-words" element={<FrequentWords />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/about" element={<About />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

function RequireAuth() {
  const { user } = useApp()
  const location = useLocation()
  return user ? <Outlet /> : <Navigate replace to={`/login?mode=register&next=${encodeURIComponent(location.pathname + location.search + location.hash)}`} />
}

function NotFound() {
  const { t } = useApp()
  return (
    <div className="page" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'5rem', color:'var(--accent)', fontWeight:700 }}>404</div>
      <p style={{ color:'var(--text2)', margin:'1rem 0' }}>{t('not_found')}</p>
      <Link to="/" className="btn btn-outline">{t('not_found_home')}</Link>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
