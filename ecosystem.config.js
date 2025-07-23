module.exports = {
  apps: [
    {
      name: 'oyagema',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/oyagema-error.log',
      out_file: './logs/oyagema-out.log',
      log_file: './logs/oyagema.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      kill_timeout: 5000
    },
    {
      name: 'donation-service',
      script: 'index.js',
      cwd: './donation-service',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8996
      },
      error_file: './logs/donation-service-error.log',
      out_file: './logs/donation-service-out.log',
      log_file: './logs/donation-service.log',
      time: true,
      max_memory_restart: '512M',
      kill_timeout: 5000
    },
    {
      name: 'upload-watcher',
      script: './scripts/upload-watcher.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        ENABLE_UPLOAD_SYNC: 'true'
      },
      error_file: './logs/upload-watcher-error.log',
      out_file: './logs/upload-watcher-out.log',
      log_file: './logs/upload-watcher.log',
      time: true,
      max_memory_restart: '256M',
      kill_timeout: 5000,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};