import { VICEAdapter } from './dist/harness/vice-adapter.js';

console.log('Testing VICEAdapter connection to live VICE...\n');

const adapter = new VICEAdapter({ port: 6510, timeout: 10000 });

adapter.connect()
  .then(async () => {
    console.log('✅ Connected successfully!');
    console.log('✅ Alive:', await adapter.alive());
    await adapter.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    console.error('❌ Error details:', error);
    process.exit(1);
  });

setTimeout(() => {
  console.error('❌ Timeout after 10 seconds');
  process.exit(1);
}, 10000);
