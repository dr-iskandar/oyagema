# Oyagema - Spiritual Music Streaming Platform

Oyagema adalah platform streaming musik spiritual yang modern dan elegan, dirancang untuk healing dan mindfulness. Aplikasi ini terinspirasi oleh Spotify dan Calm, dengan fokus pada konten yang menenangkan dan memberdayakan.

## Fitur Utama

### 🔊 Player seperti Spotify
- Play, pause, next, repeat, shuffle
- Visualizer audio atau animasi meditatif

### 🧘 Kategori Konten
- Healing & Mindfulness
- Motivasi & Self-Talk
- Narasi Spiritualitas
- Musik Instrumental Tenang
- Affirmation Loops
- Cerita Penyadaran (narrated)

### 👤 User Area
- Daftar Putar (playlist pribadi)
- Favorit
- Daily Recommendation (berdasarkan mood)
- Profil & Riwayat

### 💡 Eksplorasi & Kurasi
- "Mood-based Discovery": pilih suasana hati, dapatkan konten relevan
- Kurasi dari kreator atau coach spiritual
- "Lagu Penyadaran Hari Ini"

### 📱 Mobile Responsive + PWA
- Bisa diakses di mobile dengan experience seperti app
- Bisa di-install sebagai Progressive Web App

## Teknologi yang Digunakan

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **Streaming**: Web Audio API
- **Authentication**: Bcrypt untuk password hashing
- **PWA**: Support install on mobile / desktop
- **Type Safety**: TypeScript dengan strict mode

## Kualitas Kode

Proyek ini menekankan kualitas kode dan maintainability:

- **Type Safety**: Menggunakan TypeScript dengan strict mode dan interface yang terdefinisi dengan baik
- **Linting**: ESLint untuk menjaga konsistensi kode
- **Git Hooks**: Pre-commit hooks untuk memastikan kode yang di-commit tidak memiliki error tipe
- **Dokumentasi**: Kode dan API didokumentasikan dengan baik

Untuk memeriksa tipe:
```bash
npm run type-check
```

Untuk informasi lebih lanjut tentang praktik kode terbaik, lihat [CODE_QUALITY_RECOMMENDATIONS.md](./CODE_QUALITY_RECOMMENDATIONS.md).

## Cara Menjalankan Proyek

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup Git hooks (opsional tapi direkomendasikan):
   ```bash
   npm run setup-hooks
   ```
4. Siapkan database PostgreSQL:
   - Pastikan PostgreSQL sudah terinstall dan berjalan di sistem Anda
   - Buat database baru untuk aplikasi ini
   - Sesuaikan file `.env` dengan kredensial database Anda

4. Setup dan seed database:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Jalankan migrasi database
   npm run prisma:migrate
   
   # Seed database dengan data awal
   npm run db:seed
   ```

5. Jalankan server development:
   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

7. Untuk melihat dan mengelola database melalui UI:
   ```bash
   npm run prisma:studio
   ```
   Kemudian buka [http://localhost:5555](http://localhost:5555) di browser Anda

## Build untuk Production

### Local Production Build

```bash
# Build aplikasi
npm run build

# Jalankan versi production
npm start
```

### Docker Deployment

#### Development (Local)

```bash
# Jalankan dengan Docker Compose
docker-compose up -d --build
```

#### Production (Niagahoster Server)

Untuk deployment ke server production Niagahoster:

```bash
# Deploy ke production server
./deploy-production.sh
```

Atau manual:

```bash
# Copy production environment
cp .env.production .env

# Deploy dengan Docker Compose production
docker-compose -f docker-compose.production.yml up -d --build

# Jalankan migrasi database
docker-compose -f docker-compose.production.yml exec nextjs npx prisma migrate deploy
```

#### Production dengan Nginx (Recommended)

Untuk deployment production dengan Nginx sebagai reverse proxy:

```bash
# Deploy dengan Nginx
./deploy-nginx.sh
```

Atau manual:

```bash
# Setup SSL certificates
mkdir -p ssl
cp your-certificate.crt ssl/oyagema.com.crt
cp your-private-key.key ssl/oyagema.com.key

# Deploy dengan Nginx
docker-compose -f docker-compose.nginx.yml up -d --build
```

**Server Information:**
- Server IP: 88.222.212.111
- Domain: https://oyagema.com
- Application: http://88.222.212.111:8996 (direct access)
- Donation Service: http://88.222.212.111:5001 (direct access)

Untuk panduan deployment lengkap:
- [DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md) - Deployment tanpa Nginx
- [DEPLOYMENT_NGINX.md](./DEPLOYMENT_NGINX.md) - Deployment dengan Nginx (Recommended)

## Struktur Proyek

```
/prisma
  schema.prisma    # Skema database Prisma
  seed.ts          # Script untuk seed database
/src
  /app             # Next.js App Router
    /api           # API Routes
      /categories  # API untuk kategori
      /tracks      # API untuk track
      /playlists   # API untuk playlist
      /favorites   # API untuk favorit
      /history     # API untuk riwayat pemutaran
      /users       # API untuk user
  /components      # Komponen React
    /cards         # Komponen kartu (track, kategori)
    /layout        # Komponen layout (sidebar, main layout)
    /player        # Komponen player musik
    /sections      # Komponen section halaman
  /lib             # Utilitas dan helper functions
    /db            # Konfigurasi database
/public            # Aset statis
  /audio           # File audio
  /images          # Gambar
  /icons           # Ikon
```

## Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau buka issue untuk diskusi fitur baru atau perbaikan.

## Lisensi

Hak Cipta © 2023 Oyagema. Semua hak dilindungi.