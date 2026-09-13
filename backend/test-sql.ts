import { PrismaClient } from './src/generated/prisma/client.js';

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  
  const orderId = '00000000-0000-0000-0000-000000000001';
  await prisma.order.create({
    data: {
      id: orderId,
      customerId: '00000000-0000-0000-0000-000000000001',
      restaurantId: '00000000-0000-0000-0000-000000000001',
      status: 'PENDING',
      paymentStatus: 'PAID',
      orderType: 'DELIVERY',
      subtotal: 0,
      deliveryFee: 0,
      taxAmount: 0,
      totalAmount: 0,
      restaurantName: 'Test',
    }
  }).catch(() => {}); // Ignore if exists
  
  const assignmentId = '00000000-0000-0000-0000-000000000002';
  await prisma.deliveryAssignment.create({
    data: {
      id: assignmentId,
      orderId,
      status: 'OFFERED',
      deliveryFee: 5,
      expiresAt: new Date(Date.now() + 60000),
    }
  }).catch(() => {});

  const driverId = '00000000-0000-0000-0000-000000000003';
  await prisma.driver.create({
    data: {
      id: driverId,
      userId: '00000000-0000-0000-0000-000000000003',
      firstName: 'Test',
      lastName: 'Driver',
      phone: '123',
      vehicleType: 'CAR',
      status: 'AVAILABLE'
    }
  }).catch(() => {});

  console.log('Running query...');
  const result = await prisma.$executeRaw`
    UPDATE "delivery_assignments"
    SET "status" = 'ACCEPTED', "driverId" = ${driverId}::uuid, "accepted_at" = NOW(), "updated_at" = NOW()
    WHERE "id" = ${assignmentId}::uuid 
      AND "status" = 'OFFERED'::"DeliveryAssignmentStatus"
      AND ("expires_at" IS NULL OR "expires_at" > NOW())
  `;
  console.log('Result with cast:', result);

  const result2 = await prisma.$executeRaw`
    UPDATE "delivery_assignments"
    SET "status" = 'ACCEPTED', "driverId" = ${driverId}::uuid, "accepted_at" = NOW(), "updated_at" = NOW()
    WHERE "id" = ${assignmentId}::uuid 
      AND "status" = 'OFFERED'
  `;
  console.log('Result without cast:', result2);

  await prisma.$disconnect();
}
main().catch(console.error);
