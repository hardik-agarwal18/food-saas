import { Client } from 'pg';

async function killLocks() {
  const connectionString = 'postgresql://postgres:hardik-agarwal18@localhost:5432/test_foodDeliveryDb';
  const client = new Client({ connectionString });
  await client.connect();

  const query = `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = 'test_foodDeliveryDb'
      AND pid <> pg_backend_pid()
      AND state in ('idle in transaction', 'idle');
  `;
  const res = await client.query(query);
  console.log(`Killed ${res.rowCount} idle connections/transactions.`);
  await client.end();
}

killLocks().catch(console.error);
