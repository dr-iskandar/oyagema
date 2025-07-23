# Static Assets Management for Standalone Output

Dokumen ini menjelaskan cara mengelola aset statis (folder `public` dan `uploads`) dalam mode output `standalone` Next.js.

## Latar Belakang

Ketika menggunakan mode `output: 'standalone'` di Next.js, folder `public` tidak secara otomatis disalin ke dalam output `.next/standalone/`. Ini dapat menyebabkan aset statis seperti gambar, audio, dan file yang diunggah tidak tersedia di lingkungan produksi.

## Script yang Tersedia

Beberapa script npm telah ditambahkan untuk mengatasi masalah ini:

### 1. Otomatis saat Build

Script `build` telah dimodifikasi untuk secara otomatis menyalin folder `public` ke `.next/standalone/` setiap kali aplikasi di-build:

```bash
npm run build
```

### 2. Update Manual

Jika Anda perlu memperbarui aset statis setelah deployment tanpa melakukan build ulang:

```bash
# Memperbarui seluruh folder public
npm run update-public

# Memperbarui hanya folder uploads
npm run update-uploads

# Memperbarui semua aset statis (public dan uploads)
npm run update-static
```

### 3. Menangani Upload Aset Baru

Ketika Anda mengunggah aset baru ke folder `public/uploads`, Anda perlu menyalinnya ke output standalone agar dapat diakses:

```bash
# Menyalin aset baru dari public/uploads ke .next/standalone/public/uploads
npm run post-asset

# Atau menggunakan script shell yang lebih lengkap
npm run post-asset:sh
```

Script `post-asset:sh` akan memastikan direktori yang diperlukan ada, menyalin aset, dan memberikan informasi status.

## Deployment dengan PM2

Script `deploy-pm2.sh` juga telah diperbarui untuk memastikan folder `public` dan `uploads` disalin dengan benar selama proses deployment:

```bash
npm run deploy:pm2
```

## Catatan Penting

1. Pastikan folder `.next/standalone/public/uploads` memiliki izin tulis yang tepat jika aplikasi Anda memungkinkan pengguna mengunggah file.

2. Jika Anda mengubah konten di folder `public` setelah deployment, Anda perlu menjalankan `npm run update-public` atau `npm run update-static` untuk menyalin perubahan ke output standalone.

3. **Penting:** Setelah mengunggah aset baru ke `public/uploads`, selalu jalankan `npm run post-asset` atau `npm run post-asset:sh` agar aset tersebut dapat diakses di aplikasi yang berjalan dengan PM2.

4. Untuk lingkungan produksi dengan volume tinggi, pertimbangkan untuk menggunakan penyimpanan eksternal (seperti S3, Google Cloud Storage, dll.) untuk file yang diunggah pengguna, daripada menyimpannya di sistem file lokal.

5. **Update:** API upload (`/api/upload`) telah dimodifikasi untuk secara otomatis menjalankan script `post-asset:sh` setelah file berhasil diunggah. Lihat dokumentasi di [README-UPLOAD-API-UPDATE.md](./README-UPLOAD-API-UPDATE.md) untuk informasi lebih lanjut.