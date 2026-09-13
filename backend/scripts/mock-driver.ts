import mqtt from 'mqtt';

const MQTT_URL = process.env.MQTT_URL || 'mqtts://localhost:8883';
const client = mqtt.connect(MQTT_URL, {
  username: 'driver',
  password: 'driver_password',
  rejectUnauthorized: false // we are using self-signed certs
});

const publishLocation = (driverId: string, lat: number, lng: number, timestamp: number) => {
  const topic = `driver/${driverId}/location`;
  const payload = {
    lat,
    lng,
    timestamp
  };
  client.publish(topic, JSON.stringify(payload));
  console.log(`Published to ${topic}:`, payload);
};

client.on('connect', () => {
  console.log('Connected to Mosquitto MQTT Broker!');
  
  // Test 1: Duplicate timestamp
  console.log('--- Test 1: Duplicate timestamp ---');
  publishLocation('driver-123', 12.971598, 77.594562, 100); // Bangalore
  setTimeout(() => {
    publishLocation('driver-123', 12.934533, 77.626579, 101); // Koramangala
  }, 100);
  setTimeout(() => {
    publishLocation('driver-123', 12.9698, 77.7499, 101); // Whitefield (duplicate ts, should be ignored)
  }, 200);

  // Test 2: Out of order
  setTimeout(() => {
    console.log('--- Test 2: Out of order ---');
    publishLocation('driver-456', 12.971598, 77.594562, 100); // Bangalore
  }, 1000);
  setTimeout(() => {
    publishLocation('driver-456', 12.978369, 77.640835, 102); // Indiranagar
  }, 1100);
  setTimeout(() => {
    publishLocation('driver-456', 12.9698, 77.7499, 101); // Whitefield (out of order, should be ignored)
  }, 1200);

  // Exit shortly after
  setTimeout(() => {
    console.log('Mock driver finished publishing test scenarios.');
    client.end(false, () => {
      console.log('MQTT Client disconnected cleanly');
      process.exit(0);
    });
  }, 2000);
});
