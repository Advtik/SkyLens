import { lazy, Suspense, useEffect } from 'react'
import { CloudSun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ErrorBanner from './components/common/ErrorBanner'
import LoadingSkeleton from './components/common/LoadingSkeleton'
import SearchBar from './components/common/SearchBar'
import ForecastSection from './components/forecast/ForecastSection'
import HourlyStrip from './components/weather/HourlyStrip'
import MetricsGrid from './components/weather/MetricsGrid'
import WeatherHero from './components/weather/WeatherHero'
import { useWeatherStore } from './store/useWeatherStore'

const WeatherMap = lazy(() => import('./components/map/WeatherMap'))

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
            <CloudSun className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-black tracking-tight text-white">SkyLens</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Weather Analytics</p>
          </div>
        </div>
        <SearchBar />
      </div>
    </header>
  )
}

function LandingHero() {
  const setCity = useWeatherStore((state) => state.setCity)
  const samples = ['Delhi', 'London', 'Tokyo', 'New York']
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto grid min-h-[65vh] max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-300">MSN-inspired forecast dashboard</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">Forecasts, analytics, and live map layers in one clear view.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
          Search a city to load current weather, 48-hour forecasts, seven analytical chart views, and a RandomForest temperature trend overlay.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {samples.map((city) => (
            <button key={city} type="button" onClick={() => setCity(city)} className="min-h-11 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/15">
              {city}
            </button>
          ))}
        </div>
      </div>
      <div className="glass-card rounded-xl p-5">
        <div className="hero-clear rounded-xl p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-white/80">Preview</p>
          <div className="mt-12 flex items-end justify-between">
            <div>
              <p className="text-7xl font-black">28°C</p>
              <p className="mt-2 text-xl font-bold">Clear sky</p>
            </div>
            <CloudSun className="h-28 w-28 text-white/90" />
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function Dashboard() {
  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-10"
    >
      {[WeatherHero, MetricsGrid, HourlyStrip, ForecastSection].map((Component, index) => (
        <motion.div key={index} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
          <Component />
        </motion.div>
      ))}
      <motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
        <Suspense fallback={<LoadingSkeleton type="chart" />}>
          <WeatherMap />
        </Suspense>
      </motion.div>
    </motion.main>
  )
}

export default function App() {
  const weather = useWeatherStore((state) => state.weather)
  const loading = useWeatherStore((state) => state.loading)
  const setCity = useWeatherStore((state) => state.setCity)

  useEffect(() => {
    setCity('Delhi')
  }, [setCity])

  return (
    <div className="min-h-screen">
      <Header />
      <div className="px-4 pt-4">
        <ErrorBanner />
      </div>
      <AnimatePresence mode="wait">
        {loading && !weather ? (
          <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            <LoadingSkeleton />
          </main>
        ) : weather ? (
          <Dashboard key="dashboard" />
        ) : (
          <LandingHero key="landing" />
        )}
      </AnimatePresence>
      <footer className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
        Data by OpenWeatherMap, Open-Meteo, and OpenStreetMap.
      </footer>
    </div>
  )
}

