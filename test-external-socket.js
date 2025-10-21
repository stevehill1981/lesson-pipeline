import net from 'net';

async function testExternalSocket() {
  const socket = new net.Socket();

  // Set up ALL handlers FIRST, outside the Promise
  socket.on('connect', () => {
    console.log('[TEST] TCP connection established');
  });

  socket.on('data', (data) => {
    const response = data.toString('ascii');
    console.log('[TEST] Received data:', JSON.stringify(response));
  });

  socket.on('error', (err) => {
    console.error('[TEST] Error:', err.message);
  });

  socket.on('close', () => {
    console.log('[TEST] Socket closed');
  });

  // NOW wrap connection in Promise
  return new Promise((resolve, reject) => {
    const handler = (data) => {
      const response = data.toString('ascii');
      if (response.includes('(C:$')) {
        console.log('[TEST] ✅ Got the prompt!');
        socket.removeListener('data', handler);
        socket.end();
        resolve(true);
      }
    };

    socket.on('data', handler);

    console.log('[TEST] Connecting to localhost:6510...');
    socket.connect(6510, 'localhost');

    setTimeout(() => {
      console.error('[TEST] Timeout!');
      socket.destroy();
      reject(new Error('Timeout'));
    }, 5000);
  });
}

console.log('Testing with socket set up before Promise...\n');
testExternalSocket()
  .then(() => {
    console.log('\n✅ Success!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Failed:', err.message);
    process.exit(1);
  });
