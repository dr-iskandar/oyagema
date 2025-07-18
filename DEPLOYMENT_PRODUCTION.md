# Production Deployment Guide - Niagahoster Server

This guide covers deploying the Oyagema application to the Niagahoster production server.

## Server Information

- **Server IP:** 88.222.212.111
- **Database:** PostgreSQL
- **Database Name:** oyagema
- **Database User:** postgres
- **Database Port:** 5433
- **Application Port:** 8996
- **Donation Service Port:** 5001

## Prerequisites

1. Docker and Docker Compose installed on the server
2. Access to the server via SSH
3. PostgreSQL database already set up and running
4. Firewall configured to allow ports 8996 and 5001

## Deployment Steps

### 1. Clone Repository

```bash
git clone https://github.com/dr-iskandar/oyagema.git
cd oyagema
```

### 2. Configure Environment

The production environment file `.env.production` is already configured with:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Kacapirin9!
POSTGRES_DB=oyagema
POSTGRES_PORT=5433

# Database URL for Prisma
DATABASE_URL=postgresql://postgres:Kacapirin9!@88.222.212.111:5433/oyagema?schema=public

# Application URLs
NEXTAUTH_URL=http://88.222.212.111:8996
DONATION_SERVICE_URL=http://88.222.212.111:5001
```

### 3. Deploy Using Script

```bash
# Make script executable (if not already)
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

### 4. Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Copy production environment
cp .env.production .env

# Stop existing containers
docker-compose -f docker-compose.production.yml down

# Build and start
docker-compose -f docker-compose.production.yml up -d --build

# Run migrations
docker-compose -f docker-compose.production.yml exec nextjs npx prisma migrate deploy

# Seed database (optional)
docker-compose -f docker-compose.production.yml exec nextjs npx prisma db seed
```

## Post-Deployment

### Verify Deployment

1. **Check container status:**
   ```bash
   docker-compose -f docker-compose.production.yml ps
   ```

2. **Check logs:**
   ```bash
   docker-compose -f docker-compose.production.yml logs
   ```

3. **Test application:**
   - Main app: http://88.222.212.111:8996
   - Donation service: http://88.222.212.111:5001

### Admin Access

Use the seeded admin account:
- **Email:** oyagema@gmail.com
- **Password:** @VoiceofHeav3n

## Maintenance Commands

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Run new migrations if any
docker-compose -f docker-compose.production.yml exec nextjs npx prisma migrate deploy
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f nextjs
docker-compose -f docker-compose.production.yml logs -f donation-service
```

### Backup Database

```bash
# Create backup
pg_dump -h 88.222.212.111 -p 5433 -U postgres -d oyagema > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart nextjs
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :8996
   lsof -i :5001
   
   # Stop conflicting services
   docker-compose -f docker-compose.production.yml down
   ```

2. **Database connection issues:**
   - Verify PostgreSQL is running on port 5433
   - Check firewall settings
   - Verify credentials in `.env.production`

3. **Build failures:**
   ```bash
   # Clean build
   docker-compose -f docker-compose.production.yml down --rmi all
   docker system prune -f
   ./deploy-production.sh
   ```

### Health Checks

```bash
# Check if services are responding
curl http://88.222.212.111:8996
curl http://88.222.212.111:5001/health

# Check container health
docker-compose -f docker-compose.production.yml ps
```

## Security Considerations

1. **Environment Variables:** Never commit `.env.production` to version control
2. **Database:** Ensure PostgreSQL is properly secured
3. **Firewall:** Only open necessary ports (8996, 5001)
4. **SSL:** Consider setting up SSL/TLS for production
5. **Backups:** Regular database backups

## Monitoring

### Log Monitoring

```bash
# Monitor logs in real-time
docker-compose -f docker-compose.production.yml logs -f --tail=100
```

### Resource Usage

```bash
# Check container resource usage
docker stats
```

## Support

For issues or questions:
1. Check the logs first
2. Verify all services are running
3. Check database connectivity
4. Review this documentation

---

**Last Updated:** $(date)
**Environment:** Production - Niagahoster Server
**Maintainer:** Development Team