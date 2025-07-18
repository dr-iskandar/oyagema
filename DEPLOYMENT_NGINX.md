# Nginx Deployment Guide for Oyagema

Panduan lengkap untuk deployment aplikasi Oyagema menggunakan Nginx sebagai reverse proxy dengan domain oyagema.com.

## 📋 Prasyarat

### Server Requirements
- Ubuntu 20.04+ atau CentOS 8+
- Docker dan Docker Compose terinstall
- Domain oyagema.com sudah mengarah ke server
- Port 80 dan 443 terbuka di firewall
- SSL certificate untuk oyagema.com

### Domain Configuration
- **Domain**: oyagema.com
- **SSL**: Required (HTTPS redirect enabled)
- **DNS**: A record pointing to server IP

## 🚀 Quick Deployment

### 1. Clone Repository
```bash
git clone https://github.com/dr-iskandar/oyagema.git
cd oyagema
```

### 2. Setup Environment
```bash
# Copy and configure environment
cp .env.production .env

# Edit environment variables if needed
nano .env.production
```

### 3. Setup SSL Certificates
```bash
# Create SSL directory
mkdir -p ssl

# Copy your SSL certificates
cp /path/to/oyagema.com.crt ssl/
cp /path/to/oyagema.com.key ssl/

# Set proper permissions
chmod 600 ssl/oyagema.com.key
chmod 644 ssl/oyagema.com.crt
```

### 4. Deploy with Nginx
```bash
# Run deployment script
./deploy-nginx.sh
```

## 🔧 Manual Deployment

Jika Anda ingin melakukan deployment manual:

### 1. Prepare Environment
```bash
# Setup directories
mkdir -p ssl public/uploads
chmod 755 public/uploads

# Copy environment
cp .env.production .env
```

### 2. Start Services
```bash
# Build and start containers
docker-compose -f docker-compose.nginx.yml up -d --build

# Run migrations
docker-compose -f docker-compose.nginx.yml exec nextjs npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.nginx.yml exec nextjs npx prisma generate

# Seed database
docker-compose -f docker-compose.nginx.yml exec nextjs npm run db:seed
```

## 🌐 Service Architecture

### Port Configuration
- **Nginx**: 80 (HTTP) → 443 (HTTPS)
- **Next.js App**: Internal port 3000
- **Donation Service**: Internal port 5000
- **Database**: External PostgreSQL (88.222.212.111:5433)

### URL Structure
- **Main Application**: https://oyagema.com
- **Donation API**: https://oyagema.com/api/donation
- **Static Files**: https://oyagema.com/uploads/*
- **Health Check**: https://oyagema.com/health

## 🔒 SSL Configuration

### Obtaining SSL Certificate

#### Option 1: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d oyagema.com -d www.oyagema.com

# Copy certificates
sudo cp /etc/letsencrypt/live/oyagema.com/fullchain.pem ssl/oyagema.com.crt
sudo cp /etc/letsencrypt/live/oyagema.com/privkey.pem ssl/oyagema.com.key
sudo chown $USER:$USER ssl/*
```

#### Option 2: Commercial SSL
```bash
# Copy your commercial SSL certificates
cp your-certificate.crt ssl/oyagema.com.crt
cp your-private-key.key ssl/oyagema.com.key
```

### Auto-renewal (Let's Encrypt)
```bash
# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /path/to/oyagema/docker-compose.nginx.yml restart nginx" | sudo crontab -
```

## 📊 Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.nginx.yml logs -f

# Specific service
docker-compose -f docker-compose.nginx.yml logs -f nginx
docker-compose -f docker-compose.nginx.yml logs -f nextjs
docker-compose -f docker-compose.nginx.yml logs -f donation-service

# Nginx access logs
sudo tail -f /var/log/nginx/oyagema.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/oyagema.error.log
```

### Service Management
```bash
# Stop services
docker-compose -f docker-compose.nginx.yml down

# Restart services
docker-compose -f docker-compose.nginx.yml restart

# Update application
git pull
docker-compose -f docker-compose.nginx.yml up -d --build

# Restart specific service
docker-compose -f docker-compose.nginx.yml restart nginx
```

### Database Operations
```bash
# Run migrations
docker-compose -f docker-compose.nginx.yml exec nextjs npx prisma migrate deploy

# Access database
docker-compose -f docker-compose.nginx.yml exec nextjs npx prisma studio

# Backup database
pg_dump -h 88.222.212.111 -p 5433 -U postgres -d oyagema > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -h 88.222.212.111 -p 5433 -U postgres -d oyagema < backup_file.sql
```

## 🔍 Health Checks

### Application Health
```bash
# Check application status
curl -I https://oyagema.com/health

# Check donation service
curl -I https://oyagema.com/api/donation/health

# Check container status
docker-compose -f docker-compose.nginx.yml ps
```

### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/oyagema.com.crt -text -noout

# Test SSL configuration
openssl s_client -connect oyagema.com:443
```

#### 2. Database Connection Issues
```bash
# Test database connection
docker-compose -f docker-compose.nginx.yml exec nextjs npx prisma db pull

# Check database logs
psql -h 88.222.212.111 -p 5433 -U postgres -d oyagema -c "SELECT version();"
```

#### 3. Nginx Configuration Issues
```bash
# Test nginx configuration
docker-compose -f docker-compose.nginx.yml exec nginx nginx -t

# Reload nginx configuration
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

#### 4. Application Not Loading
```bash
# Check if services are running
docker-compose -f docker-compose.nginx.yml ps

# Check application logs
docker-compose -f docker-compose.nginx.yml logs nextjs

# Check if ports are accessible
telnet localhost 3000
telnet localhost 5000
```

### Performance Optimization

#### 1. Nginx Optimization
```bash
# Add to nginx.conf for better performance
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 100M;
```

#### 2. Database Optimization
```bash
# Monitor slow queries
docker-compose -f docker-compose.nginx.yml exec nextjs npx prisma studio

# Optimize database
psql -h 88.222.212.111 -p 5433 -U postgres -d oyagema -c "VACUUM ANALYZE;"
```

## 🔐 Security Considerations

### Firewall Configuration
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to application ports
sudo ufw deny 3000/tcp
sudo ufw deny 5000/tcp
```

### Security Headers
Nginx configuration sudah include security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

### File Upload Security
- Upload directory: `/var/www/oyagema/public/uploads`
- Blocked executable files: `.php`, `.py`, `.sh`, `.cgi`
- Max upload size: 100MB

## 📱 Admin Access

Setelah deployment berhasil:

- **URL**: https://oyagema.com/login
- **Email**: oyagema@gmail.com
- **Password**: @VoiceofHeav3n
- **Role**: ADMIN

## 🔄 Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/oyagema"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h 88.222.212.111 -p 5433 -U postgres -d oyagema > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz public/uploads/

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env.production nginx.conf docker-compose.nginx.yml

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Schedule Backup
```bash
# Add to crontab (daily at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## 📞 Support

Jika mengalami masalah:

1. Periksa logs aplikasi
2. Periksa status container
3. Periksa konfigurasi DNS
4. Periksa SSL certificate
5. Periksa koneksi database

Untuk bantuan lebih lanjut, hubungi tim development atau buat issue di repository GitHub.