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
        if (!cancelled) setError('Gagal mengambil data dari server')
      }
    }

    load()
    const id = setInterval(load, 3000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <main className="page">
      <h1>Monitoring Suhu &amp; Kelembapan</h1>

      {error && <p className="status error">{error}</p>}

      {reading ? (
        <>
          <div className="cards">
            <div className="card">
              <p className="label">Suhu</p>
              <p className="value">
                {reading.temperature.toFixed(1)} <span>°C</span>
              </p>
            </div>
            <div className="card">
              <p className="label">Kelembapan</p>
              <p className="value">
                {reading.humidity.toFixed(1)} <span>%</span>
              </p>
            </div>
          </div>
          <p className="status">
            Terakhir update: {new Date(reading.receivedAt).toLocaleString()}
          </p>
        </>
      ) : (
        !error && <p className="status">Menunggu data sensor...</p>
      )}
    </main>
  )
}

export default App
