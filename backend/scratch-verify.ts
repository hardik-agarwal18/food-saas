import { redis } from './src/config/redis.js';

async function verify() {
  const geoKey = 'driver_locations';
  
  const geoResults = await redis.geosearch(
    geoKey,
    'FROMLONLAT',
    77.594,
    12.971,
    'BYRADIUS',
    50,
    'km',
    'WITHDIST',
    'ASC'
  );
  
  console.log('Nearby drivers in Redis:', geoResults);
  
  const timestamp123 = await redis.get('driver:location:timestamp:driver-123');
  console.log('Timestamp for driver-123:', timestamp123);
  
  const timestamp456 = await redis.get('driver:location:timestamp:driver-456');
  console.log('Timestamp for driver-456:', timestamp456);

  process.exit(0);
}

verify();
