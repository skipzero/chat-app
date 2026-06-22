module.exports = {
  apps : [{
    name: 'chat-web',
    cwd: 'apps/web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  },
  { 
    name: 'chat-server',
    cwd: 'apps/server',
    script: 'bun',
    args: 'run start',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  }],
};
