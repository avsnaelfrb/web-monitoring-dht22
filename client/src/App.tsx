import { useEffect, useState } from 'react'
import './App.css'

type Reading = {
  temperature: number
  humidity: number
  receivedAt: string
}

function App() {
  const [reading, setReading] = useState<Reading | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/readings/latest')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Reading | null = await res.json()
        if (!cancelled) {
          setReading(
            data && typeof data.temperature === 'number' && typeof data.humidity === 'number'
              ? data
              : null,
          )
          setError(null)
        }
      } catch {
        if (!cancelled) setError('Gagal terhubung ke server')
      }
    }

    load()
    const id = setInterval(load, 3000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const isLive = reading ? Date.now() - new Date(reading.receivedAt).getTime() < 15000 : false
  const statusClass = error ? 'err' : reading && isLive ? 'ok' : 'wait'
  const statusText = error
    ? error
    : reading
      ? isLive
        ? 'Terhubung · data diterima'
        : 'Data terakhir diterima (menunggu pembaruan)'
      : 'Menunggu data dari sensor...'

  return (
    <main className="page">
      <header className="header">
        <h1>Monitoring Suhu &amp; Kelembapan</h1>
        <p className="subtitle">ESP8266 · Sensor DHT22 · Realtime Dashboard</p>
      </header>

      <section className="cards">
        <article className="card temp">
          <p className="card-label">Suhu</p>
          <p className="card-value">
            {reading ? reading.temperature.toFixed(1) : '--'}
            <span className="unit">°C</span>
          </p>
          <p className="card-desc">Temperatur udara saat ini</p>
        </article>

        <article className="card hum">
          <p className="card-label">Kelembapan</p>
          <p className="card-value">
            {reading ? reading.humidity.toFixed(1) : '--'}
            <span className="unit">%</span>
          </p>
          <p className="card-desc">Kelembapan relatif (RH)</p>
        </article>
      </section>

      <div className="status-bar">
        <span className={`dot ${statusClass}`} />
        <span>{statusText}</span>
      </div>

      <p className="footer">
        {reading
          ? `Pembaruan terakhir: ${new Date(reading.receivedAt).toLocaleString('id-ID')}`
          : 'Endpoint: POST /api/sensor · GET /api/readings/latest'}
      </p>
    </main>
  )
}

export default App

