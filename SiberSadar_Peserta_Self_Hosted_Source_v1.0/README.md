# SiberSadar Peserta — Self Hosted

Web interaktif awareness keamanan siber untuk peserta UMKM. Alur peserta terdiri dari pemilihan peran, pre-test, lima materi singkat, latihan berbasis kasus, checklist tindakan, post-test, badge, sertifikat penyelesaian, dan validasi kode.

## Kebutuhan

- Node.js 22.13 atau lebih baru
- npm
- Satu secret acak untuk menandatangani kode sertifikat

## Jalankan secara lokal

```bash
npm ci
cp .env.example .env.local
openssl rand -hex 32
```

Salin hasil perintah terakhir ke nilai `CERT_SECRET` di `.env.local`, lalu:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Deploy paling mudah: Vercel

1. Ekstrak ZIP ini, lalu unggah folder ke repository GitHub/GitLab/Bitbucket milik Anda.
2. Buat project baru di Vercel dan pilih repository tersebut.
3. Tambahkan environment variable `CERT_SECRET` dengan nilai acak minimal 32 karakter.
4. Deploy. Framework akan terdeteksi sebagai Next.js.

## Deploy ke VPS atau server Node

```bash
npm ci
npm run build
CERT_SECRET='secret-acak-anda' npm start
```

Aplikasi berjalan pada port 3000. Gunakan reverse proxy HTTPS seperti Nginx, Caddy, atau layanan platform Anda.

## Pemeriksaan sebelum publikasi

```bash
npm run build
npm run lint
```

Uji alur lengkap sampai sertifikat terbit, lalu tempel kode pada menu **Validasi sertifikat**.

## Catatan keamanan penting

- Jangan pernah memasukkan `.env` atau `CERT_SECRET` ke Git.
- Jika `CERT_SECRET` diganti, kode sertifikat lama tidak lagi dapat divalidasi.
- Nama peserta hanya dipakai di browser untuk mencetak sertifikat; endpoint server tidak menerima nama.
- Sertifikat adalah bukti penyelesaian pelatihan awareness, bukan Sertifikat Kompetensi BNSP/LSP.

## Bagian yang paling sering disesuaikan

- Materi, pertanyaan, peran, dan jawaban: `lib/training.ts`
- Tampilan dan alur peserta: `app/page.tsx`
- Warna dan UI: `app/globals.css`
- Aturan penerbitan/validasi sertifikat: `app/api/certificate/route.ts`
- Gambar maskot dan badge: `public/`

Materi mengacu pada Skema Information Security Awareness Program Officer, SKKNI 2024-191, SKKNI 2024-236, serta rujukan global NIST SP 800-50 Rev.1, NIST CSF 2.0, CIS Controls IG1, ENISA SME Guide, dan NIST Phish Scale.
