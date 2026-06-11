# Keamanan Owner Dashboard (Web)

## Yang sudah diterapkan di aplikasi

| Lapisan | Perlindungan |
|--------|----------------|
| **Autentikasi** | Firebase Auth (email/password), hanya role `owner` |
| **Otorisasi UI** | `/dashboard` diblokir jika bukan owner; admin langsung di-sign-out |
| **Data** | Firestore Security Rules (`firebase/firestore.rules`) — aturan di server |
| **Header HTTP** | HSTS, CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| **Metadata** | `X-Powered-By` dimatikan |
| **SEO** | `robots.txt` — `/login`, `/dashboard`, `/api` tidak diindeks |
| **API routes** | Route `/api/*` diblokir (middleware 404); inventory memakai Firestore client autentikasi |
| **Validasi input** | Stok inventory: cek outlet, jumlah positif, batas query |
| **Export Excel** | Sanitasi formula injection pada sel teks |

## Yang TIDAK boleh masuk Git

- `.env.local` / file env berisi API key & App ID
- `node_modules/`, `.next/`, `.vercel/`

Gunakan **Environment Variables** di Vercel untuk production.

## Firebase (wajib sebelum production)

1. **Authentication → Authorized domains**  
   Tambahkan domain Vercel (mis. `your-app.vercel.app`) dan domain custom.

2. **Nonaktifkan public sign-up** (Authentication → Sign-in method)  
   Buat akun owner/admin hanya lewat Firebase Console atau alur internal.

3. **API key restrictions** (Google Cloud Console → Credentials)  
   Batasi HTTP referrer ke domain production + `localhost` untuk dev.

4. **App Check** (opsional, disarankan)  
   Aktifkan untuk Web app agar hanya client resmi yang bisa memanggil Firebase.

5. **Firestore rules**  
   Deploy rules dari repo induk: `firebase deploy --only firestore:rules`  
   **Penting:** profil user tidak boleh self-assign role `owner`. Owner dibuat manual di Firebase Console.

## Catatan `NEXT_PUBLIC_*`

Variabel `NEXT_PUBLIC_FIREBASE_*` terlihat di browser — itu normal untuk Firebase Web SDK. Keamanan mengandalkan:

- Firestore Rules (bukan menyembunyikan API key)
- Restriksi domain di Firebase / Google Cloud
- Hanya akun owner yang punya akses data sensitif

## Known limitations

| Item | Catatan |
|------|---------|
| **UI guard** | Proteksi `/dashboard` di client; keamanan nyata ada di Firestore Rules |
| **Hapus admin** | Web menonaktifkan profil; penghapusan Auth user butuh Firebase Admin SDK / Cloud Function |
| **`xlsx` package** | CVE prototype pollution/ReDoS — hanya dipakai untuk export data app (bukan parse upload). Pertimbangkan upgrade SheetJS saat tersedia |

## Checklist sebelum push / deploy

- [ ] `.env.local` tidak ter-commit (`git status` bersih dari env)
- [ ] `.env.example` hanya placeholder
- [ ] Domain Vercel ditambahkan di Firebase Authorized domains
- [ ] Firestore rules sudah di-deploy ke project production
- [ ] Public sign-up dinonaktifkan di Firebase Auth
