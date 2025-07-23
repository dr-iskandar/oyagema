# PM2 Deployment Guide for Oyagema

This guide explains how to deploy the Oyagema application using PM2, a process manager for Node.js applications.

## Prerequisites

- Node.js (v20+) installed
- npm installed
- PostgreSQL installed and configured
- PM2 installed globally (`npm install -g pm2`)

## Installation

### 1. Install PM2 globally

```bash
npm install -g pm2
```

### 2. Setup PM2 startup script

This ensures PM2 starts automatically when your system reboots:

```bash
pm2 startup
```

Follow the instructions displayed after running this command.

## Deployment

### 1. Configure Environment Variables

Make sure your `.env` file is properly configured for production:

```bash
cp .env.example .env
nano .env
```

Update the following variables:

```env
# Database Configuration
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=oyagema
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://your_db_user:your_secure_password@localhost:5432/oyagema?schema=public

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com  # Or http://localhost:3000 for local deployment
NEXTAUTH_SECRET=your_secure_secret_key

# Application Configuration
NODE_ENV=production
PORT=3000
```

### 2. Deploy with the Deployment Script

We've provided a deployment script that handles all the necessary steps:

```bash
./scripts/deploy-pm2.sh
```

This script will:
- Install dependencies
- Generate Prisma client
- Build the application
- Apply database migrations
- Start or reload the application with PM2
- Perform a health check

### 3. Manual Deployment

If you prefer to deploy manually, follow these steps:

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build the application
npm run build

# Apply database migrations
npx prisma migrate deploy

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

## PM2 Commands

### Monitoring

```bash
# Check application status
pm2 status
pm2 info oyagema

# View logs
pm2 logs oyagema
pm2 logs oyagema --lines 100

# Real-time monitoring
pm2 monit
```

### Application Management

```bash
# Restart application
pm2 restart oyagema

# Reload application (zero-downtime restart)
pm2 reload oyagema

# Stop application
pm2 stop oyagema

# Delete application from PM2
pm2 delete oyagema
```

### Log Management

```bash
# Display logs
pm2 logs

# Display only oyagema logs
pm2 logs oyagema

# Clear logs
pm2 flush
```

## Troubleshooting

### Application Won't Start

Check PM2 logs for errors:

```bash
pm2 logs oyagema --lines 50
```

Check if port is already in use:

```bash
sudo lsof -i :3000
```

### Database Connection Issues

Verify your database connection string in `.env`:

```bash
nano .env
```

Check if PostgreSQL is running:

```bash
sudo systemctl status postgresql
```

### Performance Issues

Monitor system resources:

```bash
pm2 monit
```

Adjust PM2 configuration in `ecosystem.config.js` if needed:

```javascript
// Increase memory limit
max_memory_restart: '2G',

// Adjust number of instances
instances: 2,  // Or 'max' to use all CPU cores
```

## Updating the Application

To update your application:

```bash
# Pull latest changes
git pull

# Run the deployment script
./scripts/deploy-pm2.sh
```

Or manually:

```bash
# Pull latest changes
git pull

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build the application
npm run build

# Apply database migrations
npx prisma migrate deploy

# Reload the application (zero-downtime)
pm2 reload oyagema
```