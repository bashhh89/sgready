module.exports = {
  apps: [
    {
      name: 'aiscorecard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3006',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      // Advanced error handling and logging
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // Enhanced restart behavior
      restart_delay: 3000,
      max_restarts: 10,
      // Health check to ensure the app is responding correctly
      exp_backoff_restart_delay: 100,
      // Graceful shutdown
      kill_timeout: 5000
    }
  ]
}; 