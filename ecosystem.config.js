module.exports = {
  apps: [{
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
    // Performance settings
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    
    // Graceful shutdown
    kill_timeout: 5000
  }]
};