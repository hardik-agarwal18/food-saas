import { PrismaClient } from './src/generated/prisma/client.js';
const prisma = new PrismaClient();

async function promote() {
  await prisma.user.updateMany({
    where: { email: { startsWith: 'owner' } },
    data: { roles: ['RESTAURANT_OWNER'] }
  });
  await prisma.user.updateMany({
    where: { email: { startsWith: 'driver' } },
    data: { roles: ['DRIVER'] }
  });
  console.log('Promoted successfully');
}
promote();
