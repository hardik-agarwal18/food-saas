import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
async function main() {
    console.log('URL:', process.env.TEST_DATABASE_URL);
    const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 10 });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    console.log('Connecting...');
    await prisma.$connect();
    console.log('Cleaning DB...');
    await prisma.$transaction([
        prisma.passwordReset.deleteMany(),
        prisma.emailVerification.deleteMany(),
        prisma.refreshSession.deleteMany(),
        prisma.customer.deleteMany(),
        prisma.user.deleteMany(),
    ]);
    console.log('Disconnecting...');
    await prisma.$disconnect();
    await pool.end();
    console.log('Done');
}
main().catch(console.error);
