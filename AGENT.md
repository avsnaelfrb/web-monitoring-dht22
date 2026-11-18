# AGENT.md — Monitoring Suhu & Kelembapan (ESP8266)

Panduan singkat agar pengerjaan konsisten.

## Stack
- **Package manager/runtime:** Deno
- **Backend:** Express (npm via Deno) di `server/`
- **Frontend:** React + Vite + TypeScript di `client/`
- **Device:**
  - Referensi Blynk: `~/Sandbox/EXP-arduino/tugas2-praktikum/tugas2-praktikum.ino` (tidak diubah, di luar repo).
  - Firmware dashboard lokal: `~/Sandbox/EXP-arduino/tugas2-local-api/tugas2-local-api.ino` — `POST` JSON ke `http://<IP_LAPTOP>:8000/api/sensor` (satu LAN). Ganti `<IP_LAPTOP>` dengan IP komputer yang menjalankan server.

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

- `POST /api/sensor` (dipakai firmware `tugas2-local-api.ino`) — juga menerima `POST /api/readings`
  - Body: `{ "temperature": number, "humidity": number }` (dari device).
  - Server validasi angka finite, set `receivedAt` (ISO), simpan sebagai bacaan terbaru, balas 201.
  - **Seam DB (scope berikutnya):** tambahkan penyimpanan/INSERT di titik penerimaan data ini tanpa ubah kontrak request/response.
- `GET /api/readings/latest`
  - Balas bacaan terbaru, atau `null` bila belum ada data.
  - Frontend mem-poll endpoint ini.

## Penyimpanan saat ini
- **In-memory** (bacaan terakhir saja). Hilang saat server restart & tanpa riwayat — disengaja untuk tahap 1.

## Konvensi
- Jaga solusi sesederhana mungkin: perubahan minimal, tanpa dependency/abstraksi tambahan yang tidak diminta.
- Jangan ubah kontrak API di atas tanpa alasan kuat (agar integrasi device & penambahan DB tetap lurus).
- Firmware Blynk di luar repo hanya referensi; integrasi device ke dashboard ini lewat `POST /api/sensor` (atau `/api/readings`).
