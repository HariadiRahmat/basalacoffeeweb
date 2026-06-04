# Keamanan Owner Dashboard (Web)

## Yang sudah diterapkan di aplikasi

| Lapisan | Perlindungan |
|--------|----------------|
| **Autentikasi** | Firebase Auth (email/password), hanya role `owner` |
| **Otorisasi UI** | `/dashboard` diblokir jika bukan owner; admin langsung di-sign-out |
| **Data** | Firestore Security Rules (`firebase/firestore.rules`) — aturan di server |
| **Header HTTP** | HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| **Metadata** | `X-Powered-By` dimatikan |
| **SEO** | `robots.txt` — `/login` dan `/dashboard` tidak diindeks |

## Yang TIDAK boleh masuk Git

- `.env.local` / file env berisi API key & App ID
- `node_modules/`, `.next/`, `.vercel/`

Gunakan **Environment Variables** di Vercel untuk production.

## Firebase (wajib sebelum production)

1. **Authentication → Authorized domains**  
   Tambahkan domain Vercel (mis. `your-app.vercel.app`) dan domain custom.

2. **API key restrictions** (Google Cloud Console → Credentials)  
   Batasi HTTP referrer ke domain production + `localhost` untuk dev.

3. **App Check** (opsional, disarankan)  
   Aktifkan untuk Web app agar hanya client resmi yang bisa memanggil Firebase.

4. **Firestore rules**  
   Deploy rules dari repo: `firebase deploy --only firestore:rules`

## Catatan `NEXT_PUBLIC_*`

Variabel `NEXT_PUBLIC_FIREBASE_*` terlihat di browser — itu normal untuk Firebase Web SDK. Keamanan mengandalkan:

- Firestore Rules (bukan menyembunyikan API key)
- Restriksi domain di Firebase / Google Cloud
- Hanya akun owner yang punya akses data sensitif

## Checklist sebelum push / deploy

- [ ] `.env.local` tidak ter-commit (`git status` bersih dari env)
- [ ] `.env.example` hanya placeholder
- [ ] Domain Vercel ditambahkan di Firebase Authorized domains
- [ ] Firestore rules sudah di-deploy ke project production
