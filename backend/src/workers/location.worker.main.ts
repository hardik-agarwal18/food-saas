import 'reflect-metadata';
import '../infrastructure/container/index.js';
import mqtt from 'mqtt';
import { container } from 'tsyringe';
import { redis } from '../config/redis.js';
import { logger } from '../infrastructure/observability/logger/pino.js';
import { DriverLocationService } from '../modules/delivery/application/services/driver-location.service.js';
import { driverLocationPayloadSchema } from '../modules/delivery/presentation/validators/driver-location.validator.js';

const MQTT_URL = process.env.MQTT_URL || 'mqtt://mosquitto:1883';

async function bootstrap() {
  logger.info('Starting Location Worker...');

  // 1. Ensure Redis is connected
  if (redis.status !== 'ready') {
    await redis.connect();
    logger.info('Connected to Redis');
  }

  // 2. Initialize the service
  const locationService = container.resolve(DriverLocationService);

  // 2. Connect to MQTT
  logger.info(`Connecting to MQTT broker at ${MQTT_URL}`);
  logger.info(`Using MQTT Username: ${process.env.MQTT_USERNAME}`);
  const client = mqtt.connect(MQTT_URL, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  });

  client.on('connect', () => {
    logger.info('Successfully connected to MQTT broker');

    // Subscribe to all driver location updates
    client.subscribe('driver/+/location', { qos: 0 }, (err) => {
      if (err) {
        logger.error({ error: err }, 'Failed to subscribe to topic');
      } else {
        logger.info('Subscribed to driver/+/location');
      }
    });
  });

  client.on('error', (err) => {
    logger.error({ error: err }, 'MQTT Client Error');
  });

  // 4. Handle incoming messages
  client.on('message', async (topic, message) => {
    try {
      // Extract driverId from topic (driver/{driverId}/location)
      const topicParts = topic.split('/');
      if (topicParts.length !== 3 || topicParts[0] !== 'driver' || topicParts[2] !== 'location') {
        logger.warn({ topic }, 'Received message on unexpected topic');
        return;
      }
      const driverId = topicParts[1];

      // Parse payload
      const payloadString = message.toString();
      const rawPayload = JSON.parse(payloadString);

      // Validate payload
      const validationResult = driverLocationPayloadSchema.safeParse(rawPayload);
      if (!validationResult.success) {
        logger.warn(
          {
            driverId,
            errors: validationResult.error.issues,
          },
          'Invalid location payload received',
        );
        return;
      }

      const { lat, lng, timestamp } = validationResult.data;

      // Update location in Redis
      await locationService.updateLocation(driverId, lat, lng, timestamp);

      // Optional debug logging at high frequency can be noisy, kept to debug level
      logger.debug({ driverId, lat, lng, timestamp }, 'Updated driver location');
    } catch (err) {
      logger.error({ error: err, topic }, 'Error processing location message');
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down Location Worker');
  redis.quit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down Location Worker');
  redis.quit();
  process.exit(0);
});

bootstrap().catch((err) => {
  logger.error({ error: err }, 'Location Worker encountered a fatal error');
  process.exit(1);
});
