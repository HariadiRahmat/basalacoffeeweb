# Coffee Basala — Owner Analytics (Web)

Dashboard web untuk owner dengan fitur analytics yang sama seperti tab **Analytics** di aplikasi Flutter:

- Filter periode (Hari Ini / Minggu / Bulan / Tahun)
- Filter toko (Semua toko / per cabang)
- Ringkasan total jaringan
- Grafik multi-line per toko (saat Semua toko)
- Kartu performa per toko (saat satu toko dipilih)
- Data detail: transaksi, penjualan, trend, chart bar, split pembayaran, menu terlaris (donut), KPI

Backend: **Firebase Auth** + **Firestore** (project `dbcoffeebasalah`) — sama dengan app mobile.

## Setup lokal

```bash
cd owner-dashboard
cp .env.example .env.local
```

Isi `NEXT_PUBLIC_FIREBASE_APP_ID` dari Firebase Console (Web app).

```bash
npm install
npm run dev
```

Buka http://localhost:3000 — login dengan akun **owner**.

## Deploy ke Vercel (GitHub)

### 1. Firebase

1. [Firebase Console](https://console.firebase.google.com) → project **dbcoffeebasalah**
2. Tambah **Web app** jika belum ada → salin `appId`
3. **Authentication** → aktifkan **Email/Password**
4. **Authentication** → **Settings** → **Authorized domains** → tambahkan domain Vercel Anda (mis. `your-app.vercel.app`)

### 2. Push ke GitHub

Repo bisa monorepo (root = folder Flutter) atau repo terpisah hanya `owner-dashboard`.

### 3. Import di Vercel

1. https://vercel.com/new → import repo GitHub
2. **Root Directory**: `owner-dashboard` (jika monorepo)
3. **Environment Variables** — tambahkan semua dari `.env.example` (production)
4. Deploy

### 4. Variabel environment di Vercel

| Variable | Contoh |
|----------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | dari Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `dbcoffeebasalah.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `dbcoffeebasalah` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `dbcoffeebasalah.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `60499899045` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | dari Web app |

Redeploy setelah env disimpan.

## Keamanan

Lihat **[SECURITY.md](./SECURITY.md)** untuk checklist lengkap.

Ringkas:

- Hanya `profile.role === 'owner'` yang bisa masuk dashboard.
- Data dilindungi **Firestore Security Rules** (bukan hanya UI).
- Header keamanan HTTP + halaman login/dashboard `noindex`.
- **Jangan commit** `.env.local` — hanya set di Vercel Environment Variables.

## Struktur

```
src/
  app/           # login, dashboard, routing
  components/    # UI analytics
  lib/
    analytics/   # logika sama dengan Flutter (period, branch insights, chart)
    firebase.ts
    firestore-data.ts
```
