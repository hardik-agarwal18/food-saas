import mqtt from 'mqtt';
import fs from 'fs';
import path from 'path';

// Load TLS Certs
const ca = fs.readFileSync(path.join(process.cwd(), 'mosquitto', 'certs', 'ca.crt'));

// Load Tester Config
const TOTAL_DRIVERS = parseInt(process.env.TEST_DRIVERS || '1000', 10);
const PUBLISH_INTERVAL_MS = parseInt(process.env.TEST_INTERVAL_MS || '5000', 10);
const TEST_DURATION_MS = parseInt(process.env.TEST_DURATION_MS || '60000', 10);

// Base coordinates (Bangalore)
const BASE_LAT = 12.9716;
const BASE_LNG = 77.5946;

console.log(`Starting Load Test: ${TOTAL_DRIVERS} drivers, publishing every ${PUBLISH_INTERVAL_MS}ms for ${TEST_DURATION_MS / 1000}s`);
const client = mqtt.connect('mqtts://localhost:8883', {
  rejectUnauthorized: false,
  username: 'driver',
  password: 'driver_password',
});

let messagesPublished = 0;
const driverPositions = new Map<number, { lat: number; lng: number }>();

// Initialize random positions
for (let i = 0; i < TOTAL_DRIVERS; i++) {
  driverPositions.set(i, {
    lat: BASE_LAT + (Math.random() - 0.5) * 0.1,
    lng: BASE_LNG + (Math.random() - 0.5) * 0.1,
  });
}

client.on('connect', () => {
  console.log('Connected to Mosquitto Load Test Cluster!');

  const interval = setInterval(() => {
    const timestamp = Date.now();
    for (let i = 0; i < TOTAL_DRIVERS; i++) {
      const pos = driverPositions.get(i)!;
      // Drift the position slightly
      pos.lat += (Math.random() - 0.5) * 0.001;
      pos.lng += (Math.random() - 0.5) * 0.001;
      
      const payload = JSON.stringify({
        lat: pos.lat,
        lng: pos.lng,
        timestamp,
      });

      client.publish(`driver/load-tester-${i}/location`, payload, { qos: 0 }, (err) => {
        if (!err) messagesPublished++;
      });
    }
  }, PUBLISH_INTERVAL_MS);

  // Monitor publish rate
  const monitor = setInterval(() => {
    console.log(`[Load Tester] Published ${messagesPublished} messages`);
    messagesPublished = 0;
  }, 1000);

  // Auto-terminate
  setTimeout(() => {
    clearInterval(interval);
    clearInterval(monitor);
    console.log(`Load test duration (${TEST_DURATION_MS}ms) completed.`);
    client.end(false, () => {
      console.log('Load Tester gracefully disconnected.');
      process.exit(0);
    });
  }, TEST_DURATION_MS);
});

client.on('error', (err) => {
  console.error('Load tester MQTT Error:', err);
});
