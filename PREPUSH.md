# Siap push ke Git

## Cek keamanan (jalankan dulu)

```bash
cd owner-dashboard

# Pastikan .env.local TIDAK akan ikut commit
git check-ignore -v .env.local   # harus ada output (ter-ignore)

# Build sukses
npm run build
```

## Opsi A — Repo hanya `owner-dashboard`

```bash
cd owner-dashboard
git init
git add .
git status   # pastikan TIDAK ada .env.local atau node_modules
git commit -m "Add owner analytics web dashboard"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

## Opsi B — Monorepo (seluruh `coffeebasalahapp`)

Dari root project Flutter:

```bash
cd ..   # ke coffeebasalahapp
git init
git add .
git status   # cek .env.local tidak muncul
git commit -m "Add Flutter app and owner web dashboard"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

Vercel: set **Root Directory** = `owner-dashboard`.

## Setelah push — Firebase & Vercel

1. Vercel → Environment Variables (semua `NEXT_PUBLIC_FIREBASE_*`)
2. Firebase → Authorized domains → domain Vercel Anda
3. `firebase deploy --only firestore:rules` (dari root project)

Detail: [SECURITY.md](./SECURITY.md)

## Navigasi malah download file / error 500?

Biasanya cache dev Next.js rusak (`prerender-manifest.json` hilang). Gejala:
- Console: `Failed to fetch RSC payload` / `500 Internal Server Error`
- Navigasi mendownload file atau halaman putih

```bash
cd owner-dashboard
# hentikan dev server dulu (Ctrl+C di terminal npm run dev)
npm run dev:clean
```

Script `predev` sekarang otomatis membersihkan cache rusak saat `npm run dev`.

Pastikan hanya **satu** proses dev yang jalan (port 3000). Jangan jalankan `npm run build` bersamaan dengan `npm run dev`.

## Warning Firebase OAuth (192.168.x.x)

Jika buka dashboard lewat IP LAN (mis. `http://192.168.1.6:3000`), console bisa menampilkan:

`The current domain is not authorized for OAuth operations`

Login **email/password tetap jalan**. Warning ini muncul karena Firebase Auth SDK memuat iframe OAuth.

**Opsi perbaikan:**
1. Pakai `http://localhost:3000` saat development di laptop yang sama
2. Atau tambahkan IP/domain ke Firebase Console → **Authentication** → **Settings** → **Authorized domains** → **Add domain** (`192.168.1.6`)

Untuk production, pastikan domain Vercel sudah ada di daftar Authorized domains.
