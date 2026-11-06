import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/CorpusHome'
import ErrorBoundary from './components/ErrorBoundary'
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
const Morphology = lazy(() => import('./pages/Morphology'))
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
const CorpusGuide = lazy(() => import('./pages/CorpusGuide'))
const CorpusQuality = lazy(() => import('./pages/CorpusQuality'))
const StonePreview = lazy(() => import('./pages/StonePreview'))

function RouteScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
    else {
      const scroll = () => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
      const timer = setTimeout(scroll, 250)
      return () => clearTimeout(timer)
    }
  }, [pathname, hash])
  return null
}

function Layout() {
  const { theme, lang } = useApp()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
    const titles = { uz: 'Turkiy Meros — VII–VIII asrlardagi turkiy yozma yodgorliklar', ru: 'Turkiy Meros — Тюркские письменные памятники VII–VIII веков', en: 'Turkiy Meros — Turkic written monuments of the 7th–8th centuries' }
    Object.assign(titles, { tr: 'Turkiy Meros — VII–VIII. yüzyıl Türk yazıtları', tg: 'Turkiy Meros — ёдгориҳои хаттии туркии асрҳои VII–VIII', ky: 'Turkiy Meros — VII–VIII кылымдардагы түрк жазма эстеликтери', kk: 'Turkiy Meros — VII–VIII ғасырлардағы түркі жазба ескерткіштері' })
    document.title = titles[lang] || titles.uz
    const descriptions = { uz: 'VII–VIII asrlar turkiy yozma yodgorliklari: asl bitiklar, parallel o‘qish, tarixiy lug‘at, konkordans va ilmiy manbalar.', ru: 'Тюркские письменные памятники VII–VIII веков: оригиналы, параллельное чтение, словарь, конкорданс и научные источники.', en: 'Turkic written monuments of the 7th–8th centuries: original inscriptions, parallel reading, historical dictionary, concordance and scholarly sources.' }
    Object.assign(descriptions, { tr: 'VII–VIII. yüzyıl Türk yazıtları: özgün metinler, paralel okuma, tarihî sözlük, konkordans ve bilimsel kaynaklar.', tg: 'Ёдгориҳои хаттии туркии асрҳои VII–VIII: матнҳои аслӣ, хониши мувозӣ, фарҳанг, конкорданс ва сарчашмаҳои илмӣ.', ky: 'VII–VIII кылымдардагы түрк жазма эстеликтери: түп нускалар, катар окуу, тарыхый сөздүк, конкорданс жана илимий булактар.', kk: 'VII–VIII ғасырлардағы түркі жазба ескерткіштері: түпнұсқа мәтіндер, қатар оқу, тарихи сөздік, конкорданс және ғылыми дереккөздер.' })
    document.querySelector('meta[name="description"]')?.setAttribute('content', descriptions[lang] || descriptions.uz)
  }, [lang])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <RouteScroll />
      <UsageTracker />
      <MotionEffects />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary key={lang}>
        <Suspense fallback={<div className="page" style={{ textAlign:'center' }}>…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<CorpusGuide />} />
          <Route path="/stone-preview" element={<StonePreview />} />
          <Route element={<RequireAuth />}>
          <Route path="/quality" element={<CorpusQuality />} />
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
          <Route path="/corpus" element={<Concordance />} />
          <Route path="/morphology" element={<Morphology />} />
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
        </ErrorBoundary>
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
      <WorkspaceProvider><Layout /></WorkspaceProvider>
    </AppProvider>
  )
}
