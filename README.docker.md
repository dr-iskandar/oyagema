# Deployment Oyagema dengan Docker

## Ringkasan

Dokumen ini berisi panduan singkat untuk men-deploy aplikasi Oyagema menggunakan Docker pada port 8996.

## Persiapan

1. Pastikan Docker dan Docker Compose terinstal pada server
2. Salin file `.env.example` ke `.env` dan sesuaikan nilai-nilainya

```bash
cp .env.example .env
```

## Deployment

### Build dan Jalankan Container

```bash
docker-compose up -d --build
```

### Verifikasi Deployment

```bash
docker-compose ps
```

Akses aplikasi di browser:

```
http://your-domain.com:8996
```

## Konfigurasi

### Struktur Docker

- **Dockerfile**: Untuk aplikasi Next.js (port 8996)
- **donation-service/Dockerfile**: Untuk layanan donasi (port 5000)
- **docker-compose.yml**: Mengatur semua layanan termasuk PostgreSQL

### Environment Variables

Konfigurasi utama di file `.env`:

```
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=oyagema

# Next.js
NEXTAUTH_URL=http://your-domain.com:8996
NEXTAUTH_SECRET=your_nextauth_secret

# Email (untuk donation service)
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

## Pemeliharaan

### Update Aplikasi

```bash
git pull
docker-compose up -d --build
```

### Melihat Log

```bash
docker-compose logs -f
```

### Restart Layanan

```bash
docker-compose restart nextjs
```

## Dokumentasi Lengkap

Untuk panduan deployment yang lebih detail, lihat file [DEPLOYMENT_DOCKER.md](./DEPLOYMENT_DOCKER.md).