# Autosender Frontend

Frontend web Autosender dibangun dengan Vue 3, Vite, Vue Router, Pinia, Axios,
dan Socket.IO Client. Aplikasi menyediakan antarmuka untuk perangkat WhatsApp,
kontak dan grup, Inbox, broadcast, jadwal, template, feedback, monitoring, dan
administrasi.

README ini menjelaskan instalasi development dan deployment production. Frontend
harus digunakan bersama backend pada folder/proyek `forwardin`.

## Daftar isi

- [Persyaratan](#persyaratan)
- [Instalasi development](#instalasi-development)
- [Konfigurasi API](#konfigurasi-api)
- [Menjalankan frontend](#menjalankan-frontend)
- [Testing](#testing)
- [Build dan deployment](#build-dan-deployment)
- [Konfigurasi reverse proxy](#konfigurasi-reverse-proxy)
- [Troubleshooting](#troubleshooting)

## Persyaratan

- Node.js 22 LTS. Proyek saat ini diuji menggunakan Node.js 22.
- npm dan `package-lock.json`.
- Backend Autosender yang sudah berjalan.
- Browser modern.

Periksa versi:

```bash
node --version
npm --version
```

## Instalasi development

Jalankan dari folder frontend yang memiliki `package.json`, `vite.config.js`,
dan `src`.

### Linux/macOS

```bash
git clone <URL_REPOSITORY>
cd <FOLDER_REPOSITORY>/fe-autosender
npm ci
```

### Windows PowerShell

```powershell
git clone <URL_REPOSITORY>
Set-Location <FOLDER_REPOSITORY>\fe-autosender
npm.cmd ci
```

## Konfigurasi API

Buat atau edit `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Untuk production dengan domain backend terpisah:

```env
VITE_API_BASE_URL=https://api.example.com
```

Aturan penting:

- Jangan menambahkan trailing slash pada `VITE_API_BASE_URL`.
- Nilai `VITE_*` dimasukkan ke bundle browser pada saat build.
- Jangan pernah menyimpan password, private key, token, atau secret backend
  dalam variabel `VITE_*` karena nilainya dapat dilihat pengguna browser.
- Setelah mengubah environment production, frontend harus dibuild ulang.

Konfigurasi opsional yang didukung:

```env
VITE_API_MIN_INTERVAL_MS=300
VITE_API_MAX_RETRIES=3
```

`VITE_API_MIN_INTERVAL_MS` mengatur jarak minimum request global. Nilai terlalu
kecil dapat memicu rate limit backend. `VITE_API_MAX_RETRIES` mengatur retry
untuk request idempotent saat mendapat HTTP 429 atau 503.

### Hubungan dengan konfigurasi backend

Jika frontend berjalan pada `http://localhost:5173`, backend development perlu:

```env
CLIENT_URL1=http://localhost:5173
```

Jika production memakai:

- Frontend: `https://app.example.com`
- Backend: `https://api.example.com`

maka konfigurasinya adalah:

```env
# frontend
VITE_API_BASE_URL=https://api.example.com

# backend
CLIENT_URL1=https://app.example.com
BASE_URL=https://api.example.com
NODE_ENV=production
```

Origin CORS harus sama persis, termasuk protokol dan port, serta tanpa trailing
slash.

## Menjalankan frontend

Pastikan backend sudah hidup di port yang dicantumkan pada `.env.local`, lalu:

```bash
npm run dev
```

Windows PowerShell:

```powershell
npm.cmd run dev
```

Vite menggunakan port `5173` dan dikonfigurasi dengan `strictPort`, sehingga
proses akan gagal jika port tersebut sudah dipakai. Buka:

```text
http://localhost:5173
```

Pada development, jika `VITE_API_BASE_URL` dikosongkan, Vite proxy dapat
meneruskan route API yang telah dikonfigurasi di `vite.config.js`. Mengisi URL
backend secara eksplisit biasanya lebih mudah untuk didiagnosis.

## Testing

Jalankan seluruh test satu kali:

```bash
npm run test:run
```

Mode watch:

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

Build production juga harus dijadikan pemeriksaan sebelum deploy:

```bash
npm run build
```

Windows dapat mengganti `npm` dengan `npm.cmd` jika PowerShell memblokir
`npm.ps1`.

## Build dan deployment

### Build production

Environment Vite dibaca pada saat build. Pastikan URL API sudah benar sebelum
menjalankan:

```bash
npm ci
npm run test:run
npm run build
```

Hasil build berada di folder `dist`.

Pratinjau build secara lokal:

```bash
npm run preview
```

`preview` hanya untuk pemeriksaan lokal, bukan web server production.

### Deploy static files

Upload isi folder `dist` ke Nginx, Caddy, Cloudflare Pages, object storage/static
hosting, atau platform hosting pilihan. Pastikan:

- HTTPS aktif.
- Semua route SPA yang tidak cocok dengan file diarahkan ke `index.html`.
- Asset dengan hash dapat di-cache lama.
- `index.html` tidak di-cache terlalu lama agar deployment baru cepat terbaca.
- WebSocket/Socket.IO ke backend tidak diblokir proxy.

Karena Vue Router memakai `createWebHistory`, membuka URL seperti `/inbox` atau
`/admin/monitoring` secara langsung membutuhkan fallback ke `index.html`.

## Konfigurasi reverse proxy

Contoh minimum Nginx untuk frontend static:

```nginx
server {
    listen 443 ssl;
    server_name app.example.com;

    root /var/www/autosender/dist;
    index index.html;

    location /assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Konfigurasi sertifikat TLS disesuaikan dengan server. Jika frontend dan backend
memakai domain berbeda, `VITE_API_BASE_URL` harus menunjuk domain backend dan
CORS backend harus mengizinkan domain frontend.

Jika ingin memakai satu domain untuk frontend dan API, reverse proxy harus
memisahkan route API dan Socket.IO dari fallback SPA. Untuk instalasi baru,
domain terpisah seperti `app.example.com` dan `api.example.com` biasanya lebih
mudah dirawat.

## Urutan setup lengkap bersama backend

1. Instal dan konfigurasi backend `forwardin`.
2. Hidupkan PostgreSQL dan jalankan migration Prisma.
3. Build lalu jalankan backend.
4. Pastikan endpoint backend `/health` sehat.
5. Isi `VITE_API_BASE_URL` pada frontend.
6. Pastikan `CLIENT_URL1` backend sama dengan origin frontend.
7. Jalankan `npm run dev` atau build frontend untuk production.
8. Login, tambahkan device, lalu lakukan pairing WhatsApp.

## Troubleshooting

### `npm run dev` gagal karena port 5173 digunakan

Hentikan proses Vite lama. Port dikunci ke 5173 oleh `strictPort`, sehingga Vite
tidak otomatis pindah port.

### API tidak dapat diakses

- Pastikan backend hidup dan `/health` dapat dibuka.
- Periksa `VITE_API_BASE_URL` pada environment yang dipakai saat build.
- Buka Network tab browser dan periksa URL request serta status respons.
- Jangan lupa build ulang setelah mengganti environment production.

### Error CORS

- Samakan origin frontend dengan `CLIENT_URL1` atau `CLIENT_URL2` backend.
- Periksa protokol HTTP/HTTPS dan port.
- Hilangkan trailing slash.
- Restart backend setelah mengubah CORS.

### Login berhasil tetapi kembali ke halaman login

- Periksa respons `/auth/login` dan `/auth/refresh-token`.
- Pastikan reverse proxy meneruskan cookie dan header autentikasi.
- Jika frontend dan backend lintas origin, pastikan HTTPS dan konfigurasi cookie
  production sesuai.

### Halaman 404 ketika browser di-refresh

Web server belum memiliki fallback SPA. Arahkan route yang bukan file ke
`/index.html` seperti contoh Nginx di atas.

### Tampilan masih versi lama setelah deploy

- Pastikan folder `dist` terbaru sudah ter-upload.
- Jangan memberi cache jangka panjang pada `index.html`.
- Lakukan hard refresh atau hapus cache browser/service worker jika ada.

### Terlalu banyak respons 429

- Jangan menurunkan `VITE_API_MIN_INTERVAL_MS` tanpa kebutuhan.
- Periksa apakah halaman melakukan request berulang atau beberapa tab membuka
  device yang sama.
- Periksa rate-limit dan log backend.
