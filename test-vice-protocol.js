import net from 'net';

const socket = new net.Socket();

socket.on('connect', () => {
  console.log('✓ Connected to VICE on port 6502');

  // Send a simple command
  console.log('→ Sending: x\\n (exit monitor)');
  socket.write('x\n');
});

socket.on('data', (data) => {
  console.log('← Received data (' + data.length + ' bytes):');
  console.log('   Hex:', data.toString('hex'));
  console.log('   ASCII:', data.toString('ascii').replace(/[\x00-\x1F\x7F-\xFF]/g, '.'));

  // Close after first response
  setTimeout(() => socket.end(), 100);
});

socket.on('error', (err) => {
  console.error('✗ Error:', err.message);
});

socket.on('close', () => {
  console.log('✓ Connection closed');
  process.exit(0);
});

console.log('Connecting to VICE binary monitor...');
socket.connect(6502, 'localhost');

setTimeout(() => {
  console.error('✗ Timeout after 5 seconds');
  process.exit(1);
}, 5000);
