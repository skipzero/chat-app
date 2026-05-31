module.exports = {
  apps : [{
    name: 'chat-web',
    cwd: 'apps/web',
    script: 'next',
    args: 'start',
    watch: false,
    env: {
      NODE_ENV: 'production',
    }
  },
  { 
    name: 'chat-server',
    cwd: 'apps/server',
    script: 'npm',
    args: 'start',
    watch: false,
  }],
};
