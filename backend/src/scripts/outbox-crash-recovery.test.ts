import 'reflect-metadata';
import { prisma } from '../infrastructure/database/prisma.js';
import { OrderPlacedEvent } from '../modules/ordering/domain/events/order-placed.event.js';
import crypto from 'crypto';

async function runCrashRecoveryTest() {
  await prisma.$connect();

  try {
    console.log('\n=== Outbox Crash Recovery Test ===');

    const orderId = crypto.randomUUID();
    const restaurantId = crypto.randomUUID();

    console.log('1. Simulating application crash immediately after DB commit...');

    // We insert an Order and its OutboxEvent in the same transaction, simulating what PlaceOrderUseCase does
    // But we DO NOT run the outbox worker or dispatch the event in-memory.
    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          id: orderId,
          customerId: crypto.randomUUID(),
          restaurantId: restaurantId,
          status: 'READY',
          paymentStatus: 'PAID',
          orderType: 'DELIVERY',
          subtotal: 20,
          deliveryFee: 5,
          taxAmount: 2,
          totalAmount: 27,
          restaurantName: 'Test Crash Burger',
        },
      });

      const event = new OrderPlacedEvent(orderId, restaurantId, 'DELIVERY', 5);

      await tx.outboxEvent.create({
        data: {
          eventName: 'OrderPlacedEvent',
          payload: JSON.parse(JSON.stringify(event)),
        },
      });
    });

    console.log('✅ Atomically saved Order and OutboxEvent to PostgreSQL.');
    console.log('💥 Process "crashes" here (no in-memory dispatch occurs).');
    console.log('Please verify the outbox worker automatically picks up and processes this event.');
    console.log(`Check the logs for OrderID: ${orderId}`);
  } catch (error) {
    console.error('Test script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runCrashRecoveryTest();
