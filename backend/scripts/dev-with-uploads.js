const { spawn } = require('child_process');
const path = require('path');

// Chạy watch-uploads script
const watchProcess = spawn('node', [path.join(__dirname, 'watch-uploads.js')], {
  stdio: 'inherit',
  shell: true
});

// Chạy development server
const serverProcess = spawn('npm', ['run', 'start:dev'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  watchProcess.kill();
  serverProcess.kill();
  process.exit(0);
});

// Handle process errors
watchProcess.on('error', (error) => {
  console.error('Watch process error:', error);
});

serverProcess.on('error', (error) => {
  console.error('Server process error:', error);
});
