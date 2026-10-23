import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/MerosHome'
import MotionEffects from './components/MotionEffects'
import { translateMvp } from './mvp/locale'

// Sahifalar lazy yuklanadi — leaflet (xarita) va boshqa og'ir kodlar faqat kerak bo'lganda olinadi.
const Monuments = lazy(() => import('./pages/Monuments'))
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
const Library = lazy(() => import('./pages/Library'))
const Reader = lazy(() => import('./pages/Reader'))
const Learn = lazy(() => import('./pages/Learn'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Polls = lazy(() => import('./pages/Polls'))
const Words = lazy(() => import('./pages/Words'))
const Research = lazy(() => import('./pages/Research'))
const PersonalLibrary = lazy(() => import('./pages/PersonalLibrary'))
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
    document.title = translateMvp('Turkiy Meros — o‘qing, o‘rganing, kashf eting', lang)
    document.querySelector('meta[name="description"]')?.setAttribute('content', translateMvp('Turkiy Meros — yozma yodgorliklar, ochiq kitobxona, yoshlar uchun darslar va so‘zlar xazinasi.', lang))
  }, [lang])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <RouteScroll />
      <MotionEffects />
      <Navbar />
      <main>
        <Suspense fallback={<div className="page" style={{ textAlign:'center' }}>…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:id" element={<Reader />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<Lesson />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/words" element={<Words />} />
          <Route path="/research" element={<Research />} />
          <Route path="/saved" element={<PersonalLibrary />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/tools" element={<ResearchTools />} />
          <Route path="/monuments" element={<Monuments />} />
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  )
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
