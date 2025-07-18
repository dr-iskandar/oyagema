# PM2 Deployment Guide for Oyagema

This guide explains how to deploy the Oyagema application using PM2 instead of Docker. PM2 is a production process manager for Node.js applications that provides features like process monitoring, automatic restarts, and load balancing.

## Prerequisites

### System Requirements
- Node.js 18+ (recommended: Node.js 20 LTS)
- npm or yarn
- PostgreSQL database
- PM2 (will be installed automatically if not present)

### Installation

1. **Install Node.js** (if not already installed):
   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   
   # Or download from https://nodejs.org/
   ```

2. **Install PM2 globally**:
   ```bash
   npm install -g pm2
   ```

3. **Clone and setup the project**:
   ```bash
   git clone <your-repo-url>
   cd oyagema-trae
   ```

## Quick Start

### Automatic Deployment

Run the automated deployment script:

```bash
./deploy-pm2.sh
```

This script will:
- Install all dependencies
- Build the application
- Run database migrations
- Start both services with PM2
- Configure PM2 for auto-startup

### Manual Deployment

If you prefer manual control:

1. **Install dependencies**:
   ```bash
   npm ci
   cd donation-service && npm ci && cd ..
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your configuration
   ```

3. **Generate Prisma client and run migrations**:
   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## Configuration

### Environment Variables

Create or update your `.env.production` file:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/oyagema?schema=public

# Next.js
NEXTAUTH_URL=http://your-domain.com:8996
NEXTAUTH_SECRET=your_secure_secret_here

# Services
DONATION_SERVICE_URL=http://localhost:5000

# Prisma
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Application
NODE_ENV=production
PORT=8996
```

### PM2 Configuration

The `ecosystem.config.js` file contains the PM2 configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'oyagema-nextjs',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8996,
        // ... other environment variables
      }
    },
    {
      name: 'oyagema-donation-service',
      script: 'npm',
      args: 'start',
      cwd: './donation-service',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M'
    }
  ]
};
```

## PM2 Commands

### Basic Operations

```bash
# Start applications
pm2 start ecosystem.config.js --env production

# Stop applications
pm2 stop all

# Restart applications
pm2 restart all

# Reload applications (zero-downtime)
pm2 reload all

# Delete applications from PM2
pm2 delete all
```

### Monitoring

```bash
# Show process status
pm2 status

# Show logs
pm2 logs

# Show logs for specific app
pm2 logs oyagema-nextjs

# Monitor processes (real-time)
pm2 monit

# Show process information
pm2 show oyagema-nextjs
```

### Process Management

```bash
# Scale applications (run multiple instances)
pm2 scale oyagema-nextjs 2

# Save current PM2 configuration
pm2 save

# Resurrect saved processes
pm2 resurrect

# Setup auto-startup
pm2 startup
```

## Production Deployment

### Server Setup

1. **Prepare the server**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Setup application**:
   ```bash
   # Clone repository
   git clone <your-repo-url> /var/www/oyagema
   cd /var/www/oyagema
   
   # Run deployment script
   ./deploy-pm2.sh
   ```

3. **Configure reverse proxy** (Nginx example):
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
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Auto-Deployment with Git Hooks

Setup automatic deployment on git push:

```bash
# On your server, create a bare repository
git init --bare /var/repo/oyagema.git

# Create post-receive hook
cat > /var/repo/oyagema.git/hooks/post-receive << 'EOF'
#!/bin/bash
cd /var/www/oyagema
git --git-dir=/var/repo/oyagema.git --work-tree=/var/www/oyagema checkout -f
./deploy-pm2.sh
EOF

# Make it executable
chmod +x /var/repo/oyagema.git/hooks/post-receive
```

Then deploy by pushing to your server:

```bash
git remote add production user@your-server:/var/repo/oyagema.git
git push production main
```

## Advantages of PM2 over Docker

### Performance Benefits
- **Lower resource overhead**: No containerization layer
- **Direct system access**: Better performance for I/O operations
- **Native process management**: Leverages OS-level process management

### Operational Benefits
- **Simpler debugging**: Direct access to logs and processes
- **Easier monitoring**: Built-in monitoring and metrics
- **Hot reloading**: Zero-downtime deployments
- **Process clustering**: Built-in load balancing

### Development Benefits
- **Faster deployments**: No image building required
- **Easier local development**: Same environment as production
- **Simpler CI/CD**: Direct deployment without registry management

## Monitoring and Logging

### Built-in Monitoring

```bash
# Real-time monitoring
pm2 monit

# Process metrics
pm2 show oyagema-nextjs

# Memory usage
pm2 list
```

### Log Management

```bash
# View logs
pm2 logs

# Log rotation
pm2 install pm2-logrotate

# Custom log configuration
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### External Monitoring

Integrate with monitoring services:

```bash
# PM2 Plus (official monitoring)
pm2 link <secret_key> <public_key>

# Or use custom monitoring
# Export metrics to Prometheus, Grafana, etc.
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the port
   lsof -i :8996
   
   # Kill process if needed
   kill -9 <PID>
   ```

2. **Memory issues**:
   ```bash
   # Check memory usage
pm2 monit
   
   # Restart if memory limit exceeded
   pm2 restart oyagema-nextjs
   ```

3. **Database connection issues**:
   ```bash
   # Test database connection
   npx prisma db pull
   
   # Check environment variables
   pm2 show oyagema-nextjs
   ```

### Logs and Debugging

```bash
# View error logs
pm2 logs oyagema-nextjs --err

# View specific number of log lines
pm2 logs --lines 100

# Follow logs in real-time
pm2 logs --follow
```

## Security Considerations

1. **Environment Variables**: Store sensitive data in `.env` files, not in the ecosystem config
2. **File Permissions**: Ensure proper file permissions for the application directory
3. **Process User**: Run PM2 processes under a non-root user when possible
4. **Firewall**: Configure firewall to only allow necessary ports
5. **Updates**: Keep Node.js, PM2, and dependencies updated

## Backup and Recovery

```bash
# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 /backup/location/

# Backup application
tar -czf oyagema-backup-$(date +%Y%m%d).tar.gz /var/www/oyagema

# Restore PM2 processes
pm2 resurrect
```

## Performance Optimization

### Clustering

```javascript
// In ecosystem.config.js
{
  name: 'oyagema-nextjs',
  script: 'npm',
  args: 'start',
  instances: 'max', // Use all CPU cores
  exec_mode: 'cluster'
}
```

### Memory Management

```javascript
{
  max_memory_restart: '1G',
  node_args: '--max-old-space-size=1024'
}
```

### Load Balancing

PM2 automatically load balances between instances when using cluster mode.

## Conclusion

PM2 provides a robust alternative to Docker for deploying Node.js applications, offering excellent performance, monitoring capabilities, and operational simplicity. It's particularly well-suited for:

- Single-server deployments
- Applications requiring maximum performance
- Teams preferring simpler deployment workflows
- Environments where Docker overhead is a concern

For more information, visit the [PM2 documentation](https://pm2.keymetrics.io/docs/).