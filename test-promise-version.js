import net from 'net';

async function testWithPromise() {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.on('connect', () => {
      console.log('[TEST] TCP connection established');
      // Force socket into flowing mode
      socket.resume();
      console.log('[TEST] Socket resumed, ready for data');
    });

    socket.on('data', (data) => {
      const response = data.toString('ascii');
      console.log('[TEST] Received data:', JSON.stringify(response));

      if (response.includes('(C:$')) {
        console.log('[TEST] ✅ Got the prompt!');
        socket.end();
        resolve(true);
      }
    });

    socket.on('error', (err) => {
      console.error('[TEST] Error:', err.message);
      reject(err);
    });

    socket.on('close', () => {
      console.log('[TEST] Socket closed');
    });

    console.log('[TEST] Connecting to localhost:6510...');
    socket.connect(6510, 'localhost');

    setTimeout(() => {
      console.error('[TEST] Timeout!');
      socket.destroy();
      reject(new Error('Timeout'));
    }, 5000);
  });
}

console.log('Testing with Promise wrapper...\n');
testWithPromise()
  .then(() => {
    console.log('\n✅ Success!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Failed:', err.message);
    process.exit(1);
  });
