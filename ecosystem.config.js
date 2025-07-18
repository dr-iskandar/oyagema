module.exports = {
  apps: [
    {
      name: 'oyagema-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/Users/dicky.iskandar/Documents/Ikayama/oyagema-trae',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/oyagema?schema=public',
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXTAUTH_SECRET: 'your_development_secret',
        DONATION_SERVICE_URL: 'http://localhost:5000'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8996,
        DATABASE_URL: 'postgresql://postgres:Kacapirin9!@88.222.212.111:5433/oyagema?schema=public',
        NEXTAUTH_URL: 'http://88.222.212.111:8996',
        NEXTAUTH_SECRET: 'oyagema_production_secret_2024_voice_of_heaven',
        DONATION_SERVICE_URL: 'http://88.222.212.111:5001',
        PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
      }
    },
    {
      name: 'oyagema-donation-service',
      script: 'npm',
      args: 'start',
      cwd: '/Users/dicky.iskandar/Documents/Ikayama/oyagema-trae/donation-service',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        DATABASE_URL: 'postgresql://postgres:password@localhost:5432/oyagema?schema=public'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        DATABASE_URL: 'postgresql://postgres:Kacapirin9!@88.222.212.111:5433/oyagema?schema=public'
      }
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '88.222.212.111',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/oyagema-trae.git',
      path: '/var/www/oyagema',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && npx prisma migrate deploy && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};