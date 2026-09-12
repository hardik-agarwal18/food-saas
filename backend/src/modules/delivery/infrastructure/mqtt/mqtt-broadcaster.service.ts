import mqtt, { MqttClient } from 'mqtt';
import { injectable } from 'tsyringe';
import { logger } from '../../../../infrastructure/observability/logger/pino.js';
import fs from 'fs';
import path from 'path';

export interface IMqttBroadcasterService {
  broadcastDeliveryOffer(
    driverId: string,
    offer: {
      assignmentId: string;
      deliveryId: string;
      pickup: { lat: number; lng: number };
      expiresAt: string;
      estimatedETA?: number;
    },
  ): Promise<void>;
}

@injectable()
export class MqttBroadcasterService implements IMqttBroadcasterService {
  private client: MqttClient | null = null;
  private readonly logger = logger.child({ context: 'MqttBroadcasterService' });

  constructor() {
    this.init();
  }

  private init() {
    try {
      const brokerUrl = process.env.MQTT_URL || 'mqtts://localhost:8883';
      const ca = fs.readFileSync(path.join(process.cwd(), 'mosquitto', 'certs', 'ca.crt'));

      this.client = mqtt.connect(brokerUrl, {
        ca,
        rejectUnauthorized: false,
        username: 'driver', // In production, we'd use an admin/backend specific credential
        password: 'driver_password',
      });

      this.client.on('connect', () => {
        this.logger.info('MQTT Broadcaster securely connected to broker');
      });

      this.client.on('error', (err) => {
        this.logger.error({ error: err }, 'MQTT Broadcaster Error');
      });
    } catch (err) {
      this.logger.error({ error: err }, 'Failed to initialize MQTT Broadcaster');
    }
  }

  public async broadcastDeliveryOffer(
    driverId: string,
    offer: {
      assignmentId: string;
      deliveryId: string;
      pickup: { lat: number; lng: number };
      expiresAt: string;
      estimatedETA?: number;
    },
  ): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.warn('MQTT Broadcaster is not connected, cannot send offer');
      return;
    }

    const topic = `driver/${driverId}/offers`;
    const payload = JSON.stringify({
      type: 'DELIVERY_OFFER',
      ...offer,
    });

    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          this.logger.error({ driverId, error: err }, 'Failed to broadcast delivery offer');
          reject(err);
        } else {
          this.logger.info(
            { driverId, assignmentId: offer.assignmentId },
            'Broadcasted delivery offer to driver',
          );
          resolve();
        }
      });
    });
  }
}
