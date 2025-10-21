import net from 'net';

const socket = new net.Socket();
let allData = '';

socket.on('connect', () => {
  console.log('✓ Connected to VICE remote monitor\n');

  // Wait for initial prompt, then send commands
  setTimeout(() => {
    console.log('→ Sending: m 0400 0410 (read screen RAM)\\n');
    socket.write('m 0400 0410\n');
  }, 500);

  setTimeout(() => {
    console.log('→ Sending: quit\\n');
    socket.write('quit\n');
    setTimeout(() => socket.end(), 500);
  }, 1500);
});

socket.on('data', (data) => {
  const text = data.toString('ascii');
  allData += text;
  console.log('← Received:', JSON.stringify(text));
});

socket.on('error', (err) => {
  console.error('✗ Error:', err.message);
});

socket.on('close', () => {
  console.log('\n=== All data received ===');
  console.log(allData);
  console.log('✓ Connection closed');
  process.exit(0);
});

console.log('Connecting to VICE remote monitor...\n');
socket.connect(6510, 'localhost');

setTimeout(() => {
  console.error('✗ Timeout after 5 seconds');
  process.exit(1);
}, 5000);
