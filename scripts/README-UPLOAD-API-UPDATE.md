# Update API Upload untuk Menangani Aset di Standalone Output

Dokumen ini menjelaskan perubahan yang telah dilakukan pada API upload untuk mengatasi masalah akses folder `public` saat menjalankan aplikasi dengan PM2 dalam mode output `standalone` Next.js.

## Permasalahan

Ketika aplikasi Next.js dijalankan dengan PM2 dalam mode output `standalone`, folder `public` tidak secara otomatis tersedia di output `.next/standalone/`. Hal ini menyebabkan aset yang baru diunggah tidak dapat diakses oleh aplikasi yang sedang berjalan.

## Solusi yang Diterapkan

API upload (`src/app/api/upload/route.ts`) telah dimodifikasi untuk secara otomatis menjalankan script `post-asset:sh` setelah file berhasil diunggah. Script ini akan menyalin aset yang baru diunggah dari `public/uploads` ke `.next/standalone/public/uploads`.

### Perubahan pada API Upload

1. Menambahkan import `exec` dari modul `child_process`:
   ```typescript
   import { exec } from 'child_process';
   ```

2. Menambahkan kode untuk menjalankan script `post-asset:sh` setelah file berhasil disimpan:
   ```typescript
   // Run post-asset script to copy the file to standalone output
   try {
     exec('npm run post-asset:sh', (error, stdout, stderr) => {
       if (error) {
         console.error('Error running post-asset script:', error);
         return;
       }
       console.log('Post-asset script output:', stdout);
       if (stderr) {
         console.error('Post-asset script stderr:', stderr);
       }
     });
   } catch (scriptError) {
     console.error('Failed to execute post-asset script:', scriptError);
     // Continue anyway, as the file is already saved to public/uploads
   }
   ```

## Cara Kerja

1. Ketika pengguna mengunggah file melalui API upload, file tersebut disimpan di folder `public/uploads`.
2. Setelah file berhasil disimpan, API secara otomatis menjalankan script `post-asset:sh`.
3. Script `post-asset:sh` akan menyalin file yang baru diunggah dari `public/uploads` ke `.next/standalone/public/uploads`.
4. Dengan demikian, file yang baru diunggah akan langsung tersedia di aplikasi yang sedang berjalan dengan PM2.

## Catatan Penting

1. Pastikan script `post-asset:sh` memiliki izin eksekusi (`chmod +x scripts/post-asset.sh`).
2. Jika Anda menggunakan API upload lain selain `/api/upload`, pastikan untuk menambahkan kode serupa untuk menjalankan script `post-asset:sh`.
3. Untuk lingkungan produksi dengan volume tinggi, pertimbangkan untuk menggunakan penyimpanan eksternal (seperti S3, Google Cloud Storage, dll.) untuk file yang diunggah pengguna, daripada menyimpannya di sistem file lokal.