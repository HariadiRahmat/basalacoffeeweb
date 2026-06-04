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
