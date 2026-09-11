import 'reflect-metadata';
import { container } from 'tsyringe';

import { registerDeliveryModule } from '../infrastructure/container/modules/delivery.js';
import { registerOrdering } from '../infrastructure/container/modules/ordering.js';
import { InfrastructureTokens } from '../infrastructure/container/tokens/infrastructure.tokens.js';
import { DeliveryTokens } from '../modules/delivery/infrastructure/tokens/delivery.tokens.js';
import type { IClaimDeliveryAssignmentUseCase } from '../modules/delivery/application/use-cases/claim-delivery-assignment.use-case.js';
import { DeliveryAssignmentStatus } from '../modules/delivery/domain/entities/delivery-assignment.entity.js';
import { DriverStatus, VehicleType } from '../modules/delivery/domain/entities/driver.entity.js';
import { DeliveryDomainError } from '../modules/delivery/domain/errors/delivery-domain.error.js';
import crypto from 'crypto';

import { prisma } from '../infrastructure/database/prisma.js';

async function cleanup() {
  await prisma.outboxEvent.deleteMany({});
  await prisma.deliveryAssignment.deleteMany({});
  await prisma.orderItemModifier.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.restaurant.deleteMany({});
}

async function runTests() {
  await prisma.$connect();

  // Register DI
  container.registerInstance(InfrastructureTokens.PrismaClient, prisma);
  registerOrdering();
  registerDeliveryModule();

  const claimUseCase = container.resolve<IClaimDeliveryAssignmentUseCase>(
    DeliveryTokens.ClaimDeliveryAssignmentUseCase,
  );

  try {
    await cleanup();
    console.log('\n--- Setting up Test Data ---');

    // 1. Create a mock order
    const orderId = crypto.randomUUID();
    const customerId = crypto.randomUUID();
    const restaurantId = crypto.randomUUID();

    await prisma.customer.create({
      data: {
        id: customerId,
        authId: crypto.randomUUID(),
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'Customer',
        phone: '1234567890',
      },
    });

    await prisma.restaurant.create({
      data: {
        id: restaurantId,
        ownerId: crypto.randomUUID(),
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        description: 'Test',
        phone: '1234567890',
        email: 'test@restaurant.com',
        rating: 4.5,
        addressId: crypto.randomUUID(),
      },
    });

    await prisma.order.create({
      data: {
        id: orderId,
        customerId: customerId,
        restaurantId: restaurantId,
        status: 'READY',
        paymentStatus: 'PAID',
        orderType: 'DELIVERY',
        subtotal: 10,
        deliveryFee: 5,
        taxAmount: 1,
        totalAmount: 16,
        restaurantName: 'Test Burger',
      },
    });

    // 2. Create drivers A, B, C (all AVAILABLE)
    const driverIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
    const userIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];

    for (let i = 0; i < 3; i++) {
      await prisma.user.create({
        data: {
          id: userIds[i],
          email: `driver${i}@test.com`,
          passwordHash: 'hash',
        },
      });
      await prisma.driver.create({
        data: {
          id: driverIds[i],
          userId: userIds[i],
          firstName: `Driver`,
          lastName: `${i}`,
          phone: `555-000${i}`,
          vehicleType: VehicleType.CAR,
          status: DriverStatus.AVAILABLE,
        },
      });
    }

    console.log('Created Drivers: A, B, C');

    // ==========================================
    // RACE A: Same-Assignment Concurrency Test
    // ==========================================
    console.log('\n=== RACE A: Same-Assignment Concurrency Test ===');
    const assignment1Id = crypto.randomUUID();
    await prisma.deliveryAssignment.create({
      data: {
        id: assignment1Id,
        orderId,
        status: DeliveryAssignmentStatus.OFFERED,
        deliveryFee: 5,
        expiresAt: new Date(Date.now() + 60000), // 1 min from now
      },
    });

    console.log('Simulating 3 simultaneous claims for Assignment 1...');

    const race1Results = await Promise.allSettled([
      claimUseCase.execute(assignment1Id, userIds[0]),
      claimUseCase.execute(assignment1Id, userIds[1]),
      claimUseCase.execute(assignment1Id, userIds[2]),
    ]);

    let successCount = 0;
    let conflictCount = 0;

    race1Results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        console.log(`Driver ${idx} -> 200 ACCEPTED`);
        successCount++;
      } else {
        if (
          result.reason instanceof DeliveryDomainError &&
          result.reason.code === 'ALREADY_CLAIMED'
        ) {
          console.log(`Driver ${idx} -> 409 CONFLICT`);
          conflictCount++;
        } else {
          console.log(`Driver ${idx} -> Error:`, result.reason);
        }
      }
    });

    if (successCount === 1 && conflictCount === 2) {
      console.log('✅ Race A Passed: Exactly 1 winner, 2 losers.');
    } else {
      console.error(`❌ Race A Failed: Success=${successCount}, Conflicts=${conflictCount}`);
    }

    // Verify DB State
    const finalAssignment1 = await prisma.deliveryAssignment.findUnique({
      where: { id: assignment1Id },
    });
    console.log(
      `Assignment 1 final status: ${finalAssignment1?.status}, driverId: ${finalAssignment1?.driverId}`,
    );

    // ==========================================
    // RACE B: Same-Driver Concurrency Test
    // ==========================================
    console.log('\n=== RACE B: Same-Driver Concurrency Test ===');

    // Create Driver D
    const driverD_id = crypto.randomUUID();
    const userD_id = crypto.randomUUID();
    await prisma.user.create({
      data: { id: userD_id, email: `driverD@test.com`, passwordHash: 'hash' },
    });
    await prisma.driver.create({
      data: {
        id: driverD_id,
        userId: userD_id,
        firstName: `Driver`,
        lastName: `D`,
        phone: `555-0004`,
        vehicleType: VehicleType.CAR,
        status: DriverStatus.AVAILABLE,
      },
    });

    // Create assignments 2 and 3
    const assignment2Id = crypto.randomUUID();
    const assignment3Id = crypto.randomUUID();

    await prisma.deliveryAssignment.createMany({
      data: [
        {
          id: assignment2Id,
          orderId,
          status: DeliveryAssignmentStatus.OFFERED,
          deliveryFee: 5,
          expiresAt: new Date(Date.now() + 60000),
        },
        {
          id: assignment3Id,
          orderId,
          status: DeliveryAssignmentStatus.OFFERED,
          deliveryFee: 5,
          expiresAt: new Date(Date.now() + 60000),
        },
      ],
    });

    console.log('Simulating Driver D claiming Assignment 2 and Assignment 3 simultaneously...');

    const race2Results = await Promise.allSettled([
      claimUseCase.execute(assignment2Id, userD_id),
      claimUseCase.execute(assignment3Id, userD_id),
    ]);

    let r2SuccessCount = 0;
    let r2ConflictCount = 0;

    race2Results.forEach((result, idx) => {
      const assignId = idx === 0 ? 'Assignment 2' : 'Assignment 3';
      if (result.status === 'fulfilled') {
        console.log(`${assignId} -> 200 ACCEPTED`);
        r2SuccessCount++;
      } else {
        // Since driver is not AVAILABLE, it throws an error in use case or repository
        console.log(`${assignId} -> Failed with:`, result.reason.message || result.reason);
        r2ConflictCount++;
      }
    });

    if (r2SuccessCount === 1 && r2ConflictCount === 1) {
      console.log('✅ Race B Passed: Driver exactly claimed 1 assignment, the other failed.');
    } else {
      console.error(`❌ Race B Failed: Success=${r2SuccessCount}, Failed=${r2ConflictCount}`);
    }

    const driverD = await prisma.driver.findUnique({ where: { id: driverD_id } });
    console.log(`Driver D final status: ${driverD?.status}`);
  } catch (error) {
    console.error('Test script crashed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
