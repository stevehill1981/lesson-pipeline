import { VICEAdapter } from './dist/harness/vice-adapter.js';

async function testConnection() {
  console.log('Creating VICEAdapter for port 6510...');
  const adapter = new VICEAdapter({ port: 6510 });

  try {
    console.log('Attempting to connect...');
    await adapter.connect();
    console.log('✅ Connected successfully!');

    console.log('Checking if alive...');
    const alive = await adapter.alive();
    console.log(`✅ Alive: ${alive}`);

    console.log('Reading memory from screen RAM...');
    const bytes = await adapter.readMemory(0x0400, 16);
    console.log(`✅ Read ${bytes.length} bytes:`, bytes.map(b => b.toString(16).padStart(2, '0')).join(' '));

    console.log('Disconnecting...');
    await adapter.disconnect();
    console.log('✅ Disconnected successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Error details:', error);
    process.exit(1);
  }
}

testConnection();
