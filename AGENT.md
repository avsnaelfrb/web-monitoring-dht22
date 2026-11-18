# AGENT.md — Monitoring Suhu & Kelembapan (ESP8266)

Panduan singkat agar pengerjaan konsisten.

## Stack
- **Package manager/runtime:** Deno
- **Backend:** Express (npm via Deno) di `server/`
- **Frontend:** React + Vite + TypeScript di `client/`
- **Device (referensi):** ESP8266 + DHT22, lihat `~/Sandbox/EXP-arduino/tugas2-praktikum/tugas2-praktikum.ino`
  - Sketch itu contoh tugas Blynk (referensi saja, **tidak diubah** di repo ini).
  - Tugas dashboard ini: device/firmware terpisah akan mengirim data ke backend web ini.

## Struktur
- `server/` — API HTTP (Express). Menerima data sensor & melayani data terbaru ke frontend.
- `client/` — Dashboard React (Vite). Polling API untuk tampilkan suhu & kelembapan.
- `AGENT.md` — dokumen ini.

## Menjalankan (dev)
- **Backend** (dari `server/`):
  - `deno task dev` — jalankan server (default port 8000, listen `0.0.0.0` agar bisa diakses device di LAN).
- **Frontend** (dari `client/`):
  - `deno run -A npm:vite` — dev server Vite (proxy `/api` ke backend).

## Kontrak API (jaga stabil, agar mudah tambah DB nanti)

Bentuk data sensor:
```json
{ "temperature": 30.5, "humidity": 70.2, "receivedAt": "2026-11-18T12:00:00.000Z" }
```

- `POST /api/readings`
  - Body: `{ "temperature": number, "humidity": number }` (dari device).
  - Server validasi angka finite, set `receivedAt` (ISO), simpan sebagai bacaan terbaru, balas 200/201.
  - **Seam DB (scope berikutnya):** tambahkan penyimpanan/INSERT di titik penerimaan data ini tanpa ubah kontrak request/response.
- `GET /api/readings/latest`
  - Balas bacaan terbaru, atau `null`/kosong bila belum ada data.
  - Frontend mem-poll endpoint ini.

## Penyimpanan saat ini
- **In-memory** (bacaan terakhir saja). Hilang saat server restart & tanpa riwayat — disengaja untuk tahap 1.

## Konvensi
- Jaga solusi sesederhana mungkin: perubahan minimal, tanpa dependency/abstraksi tambahan yang tidak diminta.
- Jangan ubah kontrak API di atas tanpa alasan kuat (agar integrasi device & penambahan DB tetap lurus).
- Firmware Blynk di luar repo hanya referensi; integrasi device ke dashboard ini lewat `POST /api/readings`.
