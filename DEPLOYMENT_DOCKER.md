# Panduan Deployment Oyagema dengan Docker

Dokumen ini berisi panduan langkah demi langkah untuk men-deploy aplikasi Oyagema menggunakan Docker pada port 8996.

## Struktur Proyek

Proyek Oyagema terdiri dari dua komponen utama:
- Aplikasi Next.js (frontend dan backend API)
- Layanan donasi terpisah (donation-service)

## Persiapan Deployment

### Prasyarat

- Docker dan Docker Compose terinstal pada server
- Git (untuk mengkloning repositori)
- Akses ke server dengan port 8996, 5000, dan 5432 terbuka

## Langkah-langkah Deployment

### 1. Kloning Repositori

```bash
git clone <repository-url> oyagema
cd oyagema
```

### 2. Konfigurasi Environment Variables

Salin file `.env.example` ke `.env` dan sesuaikan nilai-nilainya:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=oyagema

# Next.js
NEXTAUTH_URL=http://your-domain.com:8996  # Sesuaikan dengan domain atau IP server Anda
NEXTAUTH_SECRET=your_nextauth_secret       # Generate dengan: openssl rand -base64 32

# Email (untuk donation service)
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

### 3. Build dan Jalankan Container

Jalankan perintah berikut untuk membangun dan menjalankan semua layanan:

```bash
docker-compose up -d --build
```

Perintah ini akan:
- Membangun image Docker untuk aplikasi Next.js dan donation-service
- Membuat container PostgreSQL dengan volume persisten
- Menjalankan semua layanan dalam mode detached

### 4. Verifikasi Deployment

Periksa apakah semua container berjalan dengan baik:

```bash
docker-compose ps
```

Periksa log jika ada masalah:

```bash
docker-compose logs -f
```

Akses aplikasi di browser:

```
http://your-domain.com:8996
```

## Struktur Docker

### Dockerfile (Next.js)

File `Dockerfile` di root proyek digunakan untuk membangun aplikasi Next.js. Ini menggunakan pendekatan multi-stage build untuk mengoptimalkan ukuran image:

1. **Stage deps**: Menginstal dependensi
2. **Stage builder**: Membangun aplikasi
3. **Stage runner**: Menjalankan aplikasi dengan pengguna non-root

### Dockerfile (Donation Service)

File `Dockerfile` di direktori `donation-service` digunakan untuk membangun layanan donasi:

1. Menginstal dependensi
2. Menyalin kode sumber
3. Menjalankan aplikasi Node.js

### Docker Compose

File `docker-compose.yml` mengatur semua layanan:

1. **postgres**: Database PostgreSQL dengan volume persisten
2. **nextjs**: Aplikasi Next.js yang berjalan di port 8996
3. **donation-service**: Layanan donasi yang berjalan di port 5000

## Pemeliharaan

### Update Aplikasi

Untuk memperbarui aplikasi setelah perubahan kode:

```bash
# Pull perubahan terbaru
git pull

# Rebuild dan restart container
docker-compose up -d --build
```

### Backup Database

Untuk membuat backup database:

```bash
docker exec -t oyagema_postgres_1 pg_dump -U postgres oyagema > backup_$(date +%Y-%m-%d_%H-%M-%S).sql
```

### Restart Layanan

Untuk me-restart layanan tertentu:

```bash
docker-compose restart nextjs
```

### Melihat Log

Untuk melihat log dari semua layanan:

```bash
docker-compose logs -f
```

Untuk melihat log dari layanan tertentu:

```bash
docker-compose logs -f nextjs
```

## Konfigurasi Nginx (Opsional)

Jika Anda ingin menggunakan Nginx sebagai reverse proxy, berikut adalah contoh konfigurasi:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8996;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/donation {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Container Tidak Berjalan

Periksa status container:

```bash
docker-compose ps
```

Periksa log untuk melihat error:

```bash
docker-compose logs -f
```

### Masalah Database

Jika ada masalah dengan database, pastikan volume database tidak rusak:

```bash
docker-compose down
docker volume ls  # Identifikasi volume postgres
docker-compose up -d
```

### Masalah Koneksi

Pastikan port 8996 dan 5000 terbuka di firewall server:

```bash
sudo ufw status  # Untuk Ubuntu
```

Atau periksa dengan:

```bash
netstat -tulpn | grep -E '8996|5000'
```

## Kesimpulan

Dengan mengikuti panduan ini, Anda dapat men-deploy aplikasi Oyagema menggunakan Docker dengan konfigurasi yang optimal. Aplikasi akan berjalan di port 8996 dan dapat diakses melalui browser.