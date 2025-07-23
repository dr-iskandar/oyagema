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
    }
  ]
};