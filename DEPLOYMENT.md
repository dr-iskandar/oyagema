# 🚀 Deployment Guide - Oyagema Music Platform

Panduan lengkap untuk deploy aplikasi Oyagema di remote server dengan berbagai opsi cloud provider.

## 🌐 Cloud Provider Options

### Recommended Providers
- **DigitalOcean** - Droplet 2GB RAM, 50GB SSD ($12/month)
- **AWS EC2** - t3.small instance dengan EBS storage
- **Google Cloud Platform** - e2-small instance
- **Vultr** - Regular Performance 2GB RAM ($12/month)
- **Linode** - Nanode 2GB ($12/month)

## 📋 Prerequisites

- Ubuntu Server 20.04+ atau 22.04 LTS
- Domain name (wajib untuk production)
- SSL Certificate (Let's Encrypt)
- **Minimal Specs:**
  - 2GB RAM (4GB recommended)
  - 50GB SSD Storage
  - 2 CPU cores
- SSH access ke server

## 🛠️ Initial Server Setup

### 1. Connect to Server
```bash
# Connect via SSH
ssh root@your-server-ip
# atau jika menggunakan key
ssh -i ~/.ssh/your-key.pem ubuntu@your-server-ip
```

### 2. Create Non-Root User (Recommended)
```bash
# Create new user
adduser oyagema
usermod -aG sudo oyagema

# Setup SSH for new user
mkdir /home/oyagema/.ssh
cp ~/.ssh/authorized_keys /home/oyagema/.ssh/
chown -R oyagema:oyagema /home/oyagema/.ssh
chmod 700 /home/oyagema/.ssh
chmod 600 /home/oyagema/.ssh/authorized_keys
```

### 3. Basic Security Configuration
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Configure SSH (optional but recommended)
sudo nano /etc/ssh/sshd_config
```

Edit SSH config:
```
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart ssh
```

### 4. Setup Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🐳 Deployment Options

### Option 1: Traditional Deployment (Recommended)

#### 1. Install Node.js 20+ (LTS)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version

# Install yarn (optional but recommended)
npm install -g yarn
```

#### Alternative: Using NVM (Node Version Manager)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### 2. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Option 2: Docker Deployment

#### 1. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### 2. Create Docker Configuration
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create uploads directory
RUN mkdir -p public/uploads

EXPOSE 3000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://oyagema_user:your_password@db:5432/oyagema_db
    volumes:
      - ./public/uploads:/app/public/uploads
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=oyagema_db
      - POSTGRES_USER=oyagema_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🗄️ Database & Web Server Setup

### For Traditional Deployment

#### 1. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

#### 2. Install PostgreSQL 15
```bash
# Add PostgreSQL official repository
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# Install PostgreSQL
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15 -y

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

### For Docker Deployment

Jika menggunakan Docker, PostgreSQL dan Nginx sudah dikonfigurasi dalam `docker-compose.yml`. Lanjut ke bagian **Application Deployment**.

## 🗄️ Database Setup

### 1. Create Database User
```bash
sudo -u postgres psql
```

```sql
CREATE USER oyagema_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE oyagema_db OWNER oyagema_user;
GRANT ALL PRIVILEGES ON DATABASE oyagema_db TO oyagema_user;
\q
```

### 2. Configure PostgreSQL (Optional)
```bash
sudo nano /etc/postgresql/12/main/postgresql.conf
```
Uncomment dan ubah:
```
listen_addresses = 'localhost'
```

## 📁 Application Deployment

### Traditional Deployment

#### 1. Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/your-username/oyagema-trae.git
sudo chown -R $USER:$USER oyagema-trae
cd oyagema-trae

# Set proper permissions
chmod +x scripts/*
```

#### 2. Install Dependencies
```bash
# Install with npm
npm ci --production=false

# Or with yarn (recommended)
yarn install --frozen-lockfile
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env
nano .env
```

Konfigurasi `.env` untuk production:
```env
# Database Configuration
DATABASE_URL="postgresql://oyagema_user:your_secure_password@localhost:5432/oyagema_db"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-min-32-chars"

# Admin Configuration
ADMIN_REGISTRATION_KEY="your-admin-registration-key-2024"

# Application Configuration
NODE_ENV="production"
PORT=3000

# File Upload Configuration
MAX_FILE_SIZE=104857600  # 100MB in bytes
UPLOAD_DIR="/var/www/oyagema-trae/public/uploads"

# Security Headers
CSP_ENABLED=true
HSTS_ENABLED=true

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/oyagema/app.log"

# Performance
NEXT_TELEMETRY_DISABLED=1
```

### Docker Deployment

#### 1. Clone and Setup
```bash
# Clone repository
git clone https://github.com/your-username/oyagema-trae.git
cd oyagema-trae

# Create environment file
cp .env.example .env
nano .env
```

Konfigurasi `.env` untuk Docker:
```env
# Database (using Docker service name)
DATABASE_URL="postgresql://oyagema_user:your_secure_password@db:5432/oyagema_db"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-min-32-chars"

# Admin
ADMIN_REGISTRATION_KEY="your-admin-registration-key-2024"

# Application
NODE_ENV="production"
PORT=3000
```

### 4. Database Migration
```bash
npx prisma generate
npx prisma migrate deploy
```

### 5. Create Admin User
```bash
npm run create-admin
```

### 6. Build Application
```bash
npm run build
```

### 7. Create Upload Directory
```bash
sudo mkdir -p /var/www/oyagema-trae/public/uploads
sudo chown -R www-data:www-data /var/www/oyagema-trae/public/uploads
sudo chmod -R 755 /var/www/oyagema-trae/public/uploads
```

## 🔄 PM2 Configuration

### 1. Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'oyagema',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/oyagema-trae',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/oyagema-error.log',
    out_file: '/var/log/pm2/oyagema-out.log',
    log_file: '/var/log/pm2/oyagema.log',
    time: true
  }]
};
```

### 2. Start Application with PM2
```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Nginx Configuration

### 1. Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/oyagema
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (akan disetup dengan Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # File Upload Size
    client_max_body_size 100M;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static Files
    location /_next/static/ {
        alias /var/www/oyagema-trae/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /var/www/oyagema-trae/public/images/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    location /uploads/ {
        alias /var/www/oyagema-trae/public/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Main Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/oyagema /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate (Let's Encrypt)

### 1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Auto-renewal Setup
```bash
sudo crontab -e
```
Tambahkan:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 Firewall Configuration

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 📊 Monitoring & Logging

### Application Monitoring

#### PM2 Monitoring (Traditional Deployment)
```bash
# Check application status
pm2 status
pm2 info oyagema

# View logs
pm2 logs oyagema
pm2 logs oyagema --lines 100

# Real-time monitoring
pm2 monit

# Restart if needed
pm2 restart oyagema
pm2 reload oyagema  # Zero-downtime restart
```

#### Docker Monitoring
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f nginx

# Container stats
docker stats

# Restart services
docker-compose restart app
```

### System Monitoring

#### Install Monitoring Tools
```bash
# Install htop, iotop, and other monitoring tools
sudo apt install -y htop iotop nethogs ncdu

# Install Node.js monitoring
npm install -g clinic
```

#### Basic System Monitoring
```bash
# System resources
htop

# Disk usage
df -h
ncdu /var/www/oyagema-trae

# Network monitoring
nethogs

# Database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### Log Management

#### Setup Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/oyagema
```

Add configuration:
```
/var/log/oyagema/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 oyagema oyagema
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 oyagema oyagema
}
```

#### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Filter specific errors
sudo grep "error" /var/log/nginx/error.log | tail -20
```

#### Application Logs
```bash
# Create log directory
sudo mkdir -p /var/log/oyagema
sudo chown oyagema:oyagema /var/log/oyagema

# View application logs
tail -f /var/log/oyagema/app.log

# PM2 logs
tail -f /var/log/pm2/oyagema.log
tail -f /var/log/pm2/oyagema-error.log
```

## 💾 Backup & Disaster Recovery

### Database Backup

#### Automated Database Backup Script
Create `/home/oyagema/scripts/backup-db.sh`:
```bash
#!/bin/bash

# Configuration
DB_NAME="oyagema_db"
DB_USER="oyagema_user"
BACKUP_DIR="/home/oyagema/backups/database"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/oyagema_backup_${DATE}.sql"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Starting database backup..."
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Database backup completed: ${BACKUP_FILE}.gz"
```

#### Setup Automated Backups
```bash
# Make script executable
chmod +x /home/oyagema/scripts/backup-db.sh

# Add to crontab for daily backups at 2 AM
crontab -e
```

Add to crontab:
```
0 2 * * * /home/oyagema/scripts/backup-db.sh >> /var/log/oyagema/backup.log 2>&1
```

### File Backup

#### Backup Upload Files
Create `/home/oyagema/scripts/backup-files.sh`:
```bash
#!/bin/bash

# Configuration
SOURCE_DIR="/var/www/oyagema-trae/public/uploads"
BACKUP_DIR="/home/oyagema/backups/files"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/uploads_backup_${DATE}.tar.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Starting files backup..."
tar -czf $BACKUP_FILE -C $(dirname $SOURCE_DIR) $(basename $SOURCE_DIR)

# Remove old backups
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Files backup completed: $BACKUP_FILE"
```

### Cloud Backup (Optional)

#### AWS S3 Backup
```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS credentials
aws configure

# Sync backups to S3
aws s3 sync /home/oyagema/backups/ s3://your-backup-bucket/oyagema-backups/
```

#### Backup Restoration
```bash
# Restore database
gunzip -c /path/to/backup.sql.gz | psql -h localhost -U oyagema_user -d oyagema_db

# Restore files
tar -xzf /path/to/uploads_backup.tar.gz -C /var/www/oyagema-trae/public/
```

## 🔄 Deployment Updates

### Traditional Deployment Update Script
Create `/home/oyagema/scripts/deploy.sh`:
```bash
#!/bin/bash

set -e  # Exit on any error

# Configuration
APP_DIR="/var/www/oyagema-trae"
BACKUP_DIR="/home/oyagema/backups/deployments"
DATE=$(date +"%Y%m%d_%H%M%S")

echo "Starting deployment process..."

# Create backup before deployment
echo "Creating pre-deployment backup..."
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U oyagema_user -d oyagema_db | gzip > "${BACKUP_DIR}/pre_deploy_${DATE}.sql.gz"

# Navigate to app directory
cd $APP_DIR

# Stash any local changes
git stash

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build application
echo "Building application..."
npm run build

# Restart application with zero downtime
echo "Restarting application..."
pm2 reload oyagema

# Wait for app to be ready
sleep 5

# Health check
echo "Performing health check..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    # Clean up old backups
    find $BACKUP_DIR -name "pre_deploy_*.sql.gz" -mtime +7 -delete
else
    echo "❌ Health check failed! Rolling back..."
    # Restore from backup if needed
    pm2 restart oyagema
    exit 1
fi

echo "Deployment completed successfully!"
```

### Docker Deployment Update
```bash
#!/bin/bash

set -e

echo "Starting Docker deployment update..."

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Health check
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Docker deployment successful!"
else
    echo "❌ Health check failed!"
    exit 1
fi
```

### Make Scripts Executable
```bash
chmod +x /home/oyagema/scripts/*.sh
```

## 🛡️ Security Best Practices

1. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Database Security**
   - Gunakan password yang kuat
   - Batasi akses database hanya dari localhost
   - Regular backup database

3. **File Permissions**
   ```bash
   sudo chown -R www-data:www-data /var/www/oyagema-trae/public/uploads
   sudo chmod -R 755 /var/www/oyagema-trae
   ```

4. **Environment Variables**
   - Jangan commit file `.env` ke repository
   - Gunakan secrets yang kuat untuk production

## 🔧 Troubleshooting

### Health Check Endpoint

Create `/src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check disk space for uploads
    const fs = require('fs');
    const stats = fs.statSync('/var/www/oyagema-trae/public/uploads');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uploads: 'accessible',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

### Common Issues & Solutions

#### 1. Application Won't Start

**Symptoms:**
- PM2 shows app as "errored" or "stopped"
- Port 3000 not responding

**Diagnosis:**
```bash
# Check PM2 logs
pm2 logs oyagema --lines 50

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Check Node.js version
node --version

# Check disk space
df -h

# Check memory usage
free -h
```

**Solutions:**
```bash
# Restart application
pm2 restart oyagema

# If port is occupied, kill process
sudo kill -9 $(sudo lsof -t -i:3000)

# Clear PM2 logs if too large
pm2 flush oyagema

# Reinstall dependencies
cd /var/www/oyagema-trae
rm -rf node_modules package-lock.json
npm install
```

#### 2. Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- Prisma client errors

**Diagnosis:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -c "\l"

# Check database user permissions
sudo -u postgres psql -c "\du"

# Test connection with app credentials
psql -h localhost -U oyagema_user -d oyagema_db -c "SELECT version();"
```

**Solutions:**
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Reset user password
sudo -u postgres psql -c "ALTER USER oyagema_user PASSWORD 'new_password';"

# Check pg_hba.conf for authentication issues
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Regenerate Prisma client
cd /var/www/oyagema-trae
npx prisma generate
```

#### 3. File Upload Errors

**Symptoms:**
- 413 Request Entity Too Large
- Permission denied errors
- Files not saving

**Diagnosis:**
```bash
# Check upload directory permissions
ls -la /var/www/oyagema-trae/public/uploads

# Check disk space
df -h /var/www/oyagema-trae/public/uploads

# Check Nginx upload limits
sudo nginx -T | grep client_max_body_size
```

**Solutions:**
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/oyagema-trae/public/uploads
sudo chmod -R 755 /var/www/oyagema-trae/public/uploads

# Increase Nginx upload limit
sudo nano /etc/nginx/sites-available/oyagema
# Add: client_max_body_size 100M;
sudo systemctl reload nginx

# Clean up old uploads if disk is full
find /var/www/oyagema-trae/public/uploads -type f -mtime +30 -delete
```

#### 4. Nginx Configuration Issues

**Symptoms:**
- 502 Bad Gateway
- SSL certificate errors
- Static files not loading

**Diagnosis:**
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates

# Test upstream connection
curl -I http://localhost:3000
```

**Solutions:**
```bash
# Reload Nginx configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Renew SSL certificate
sudo certbot renew --dry-run
sudo certbot renew

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### 5. Performance Issues

**Symptoms:**
- Slow response times
- High CPU/memory usage
- Database timeouts

**Diagnosis:**
```bash
# Check system resources
htop

# Check PM2 monitoring
pm2 monit

# Check database performance
sudo -u postgres psql -d oyagema_db -c "SELECT * FROM pg_stat_activity;"

# Check slow queries
sudo tail -f /var/log/postgresql/postgresql-15-main.log | grep "duration"
```

**Solutions:**
```bash
# Restart application
pm2 reload oyagema

# Optimize database
sudo -u postgres psql -d oyagema_db -c "VACUUM ANALYZE;"

# Clear application cache
cd /var/www/oyagema-trae
rm -rf .next/cache
npm run build

# Scale PM2 instances
pm2 scale oyagema 4  # Scale to 4 instances
```

### Emergency Recovery

#### Quick Recovery Script
Create `/home/oyagema/scripts/emergency-recovery.sh`:
```bash
#!/bin/bash

echo "Starting emergency recovery..."

# Stop all services
pm2 stop all
sudo systemctl stop nginx

# Check and fix permissions
sudo chown -R oyagema:oyagema /var/www/oyagema-trae
sudo chown -R www-data:www-data /var/www/oyagema-trae/public/uploads

# Clear caches
cd /var/www/oyagema-trae
rm -rf .next/cache
rm -rf node_modules/.cache

# Restart database
sudo systemctl restart postgresql
sleep 5

# Restart services
sudo systemctl start nginx
pm2 start ecosystem.config.js

echo "Emergency recovery completed!"
```

## 🎯 Performance Optimization

### 1. Nginx Caching Configuration
Add to your Nginx config:
```nginx
# Cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m use_temp_path=off;

# In server block
location /api/ {
    proxy_cache app_cache;
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_lock on;
    
    proxy_pass http://localhost:3000;
    # ... other proxy settings
}
```

### 2. Database Optimization

#### PostgreSQL Configuration
Edit `/etc/postgresql/15/main/postgresql.conf`:
```
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection settings
max_connections = 100

# Performance settings
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_min_duration_statement = 1000  # Log slow queries
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

#### Database Indexing
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_tracks_category_id ON "Track" ("categoryId");
CREATE INDEX CONCURRENTLY idx_tracks_created_at ON "Track" ("createdAt");
CREATE INDEX CONCURRENTLY idx_categories_slug ON "Category" ("slug");
CREATE INDEX CONCURRENTLY idx_users_email ON "User" ("email");
```

### 3. Application Performance

#### PM2 Cluster Mode
Update `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'oyagema',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/oyagema-trae',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Performance settings
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    
    // Logging
    error_file: '/var/log/pm2/oyagema-error.log',
    out_file: '/var/log/pm2/oyagema-out.log',
    log_file: '/var/log/pm2/oyagema.log',
    time: true,
    
    // Auto restart on file changes (disable in production)
    watch: false,
    
    // Graceful shutdown
    kill_timeout: 5000
  }]
};
```

### 4. CDN Setup (Optional)

#### CloudFlare Setup
1. Sign up for CloudFlare
2. Add your domain
3. Update DNS to CloudFlare nameservers
4. Enable caching rules:

```
# Cache static assets
*.css, *.js, *.png, *.jpg, *.jpeg, *.gif, *.svg, *.ico, *.woff, *.woff2
Cache Level: Standard
Browser Cache TTL: 1 year
Edge Cache TTL: 1 month
```

### 5. Image Optimization

#### Setup Image Processing
```bash
# Install sharp for image optimization
npm install sharp

# Install imagemin for compression
npm install imagemin imagemin-mozjpeg imagemin-pngquant
```

Add to your Next.js config:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Enable SWC minification
  swcMinify: true,
}
```

### 6. Connection Pooling

Update your Prisma configuration:
```env
# In .env
DATABASE_URL="postgresql://oyagema_user:password@localhost:5432/oyagema_db?connection_limit=20&pool_timeout=20"
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Server setup completed (Ubuntu 20.04+)
- [ ] Domain name configured
- [ ] SSH access established
- [ ] Firewall configured
- [ ] Non-root user created

### Application Setup
- [ ] Node.js 20+ installed
- [ ] PostgreSQL 15 installed and configured
- [ ] Nginx installed and configured
- [ ] PM2 installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Admin user created

### Security
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] File permissions set correctly
- [ ] Database secured
- [ ] Firewall rules applied
- [ ] SSH hardened

### Monitoring & Backup
- [ ] PM2 monitoring setup
- [ ] Log rotation configured
- [ ] Database backup automated
- [ ] File backup automated
- [ ] Health check endpoint created
- [ ] Monitoring tools installed

### Performance
- [ ] Nginx caching enabled
- [ ] Database indexes created
- [ ] PM2 cluster mode configured
- [ ] Image optimization setup
- [ ] CDN configured (optional)

### Post-Deployment
- [ ] Application accessible via domain
- [ ] SSL certificate working
- [ ] File uploads working
- [ ] Database operations working
- [ ] Admin panel accessible
- [ ] Health check responding
- [ ] Logs being generated
- [ ] Backup scripts tested

## 🚨 Emergency Contacts

### Quick Commands for Emergency
```bash
# Check all services status
sudo systemctl status nginx postgresql
pm2 status

# Restart all services
sudo systemctl restart nginx postgresql
pm2 restart all

# Check logs quickly
pm2 logs --lines 20
sudo tail -20 /var/log/nginx/error.log

# Emergency recovery
/home/oyagema/scripts/emergency-recovery.sh
```

### Monitoring URLs
- **Application**: https://yourdomain.com
- **Health Check**: https://yourdomain.com/api/health
- **Admin Panel**: https://yourdomain.com/admin

## 📞 Support & Maintenance

### Regular Maintenance Tasks

#### Weekly
- [ ] Check application logs for errors
- [ ] Monitor disk space usage
- [ ] Review backup logs
- [ ] Check SSL certificate expiry

#### Monthly
- [ ] Update system packages
- [ ] Review database performance
- [ ] Clean up old log files
- [ ] Test backup restoration
- [ ] Review security logs

#### Quarterly
- [ ] Update Node.js version
- [ ] Update application dependencies
- [ ] Review and update security configurations
- [ ] Performance optimization review
- [ ] Disaster recovery testing

### Getting Help

Jika mengalami masalah deployment:

1. **Check Logs First**
   ```bash
   pm2 logs oyagema --lines 50
   sudo tail -50 /var/log/nginx/error.log
   sudo journalctl -u postgresql -n 50
   ```

2. **Run Health Check**
   ```bash
   curl -s https://yourdomain.com/api/health | jq
   ```

3. **Check System Resources**
   ```bash
   df -h
   free -h
   htop
   ```

4. **Review Configuration**
   ```bash
   sudo nginx -t
   pm2 info oyagema
   ```

### Documentation References
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**🎉 Congratulations on your successful deployment!**

*Remember: A well-monitored application is a reliable application. Keep your logs clean, your backups current, and your monitoring active.*

**Happy Deploying! 🚀**