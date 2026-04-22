import { ref, onUnmounted } from 'vue'

const WEATHER_ICONS = {
  113: '☀️', 116: '⛅', 119: '☁️', 122: '🌫️',
  143: '🌫️', 176: '🌦️', 179: '🌨️', 182: '🌧️',
  200: '⛈️', 227: '❄️', 230: '❄️', 248: '🌫️',
  260: '🌫️', 263: '🌦️', 266: '🌦️', 281: '🌧️',
  293: '🌦️', 296: '🌦️', 299: '🌧️', 302: '🌧️',
  305: '🌧️', 308: '🌧️', 317: '🌨️', 320: '🌨️',
  323: '🌨️', 326: '🌨️', 329: '❄️', 332: '❄️',
  335: '❄️', 338: '❄️', 353: '🌦️', 356: '🌧️',
  359: '🌧️', 362: '🌨️', 365: '🌨️', 386: '⛈️',
  389: '⛈️', 392: '🌨️', 395: '❄️',
}

// Singleton weather state
const weather = ref({ nice: null, philly: null })
let refreshInterval = null
let fetchCount = 0

async function fetchCity(city) {
  const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('json')) throw new Error('Non-JSON response')
  const data = await res.json()
  const c = data.current_condition[0]
  return {
    tempC: parseInt(c.temp_C),
    feelsLikeC: parseInt(c.FeelsLikeC),
    description: c.weatherDesc[0].value,
    icon: WEATHER_ICONS[parseInt(c.weatherCode)] ?? '🌡️',
    humidity: parseInt(c.humidity),
  }
}

async function doRefresh() {
  const [niceResult, phillyResult] = await Promise.allSettled([
    fetchCity('Nice,France'),
    fetchCity('Philadelphia,PA'),
  ])
  weather.value = {
    nice: niceResult.status === 'fulfilled' ? niceResult.value : weather.value.nice,
    philly: phillyResult.status === 'fulfilled' ? phillyResult.value : weather.value.philly,
  }
}

export function useWeather() {
  fetchCount++
  if (!refreshInterval) {
    doRefresh()
    refreshInterval = setInterval(doRefresh, 30 * 60 * 1000)
  }

  onUnmounted(() => {
    fetchCount--
    if (fetchCount <= 0 && refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
      fetchCount = 0
    }
  })

  return { weather, refresh: doRefresh }
}
