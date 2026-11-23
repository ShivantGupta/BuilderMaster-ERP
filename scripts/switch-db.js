const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'sqlite';
const root = path.join(__dirname, '..');
const prismaDir = path.join(root, 'prisma');
const schemaTarget = path.join(prismaDir, 'schema.prisma');
const envPath = path.join(root, '.env');

if (target === 'postgres' || target === 'postgresql') {
  const pgSchema = path.join(prismaDir, 'schema.postgres.prisma');
  if (!fs.existsSync(pgSchema)) {
    console.error('schema.postgres.prisma not found!');
    process.exit(1);
  }
  fs.copyFileSync(pgSchema, schemaTarget);
  console.log('Switched Prisma schema to PostgreSQL.');
  console.log('Ensure your .env has DATABASE_URL="postgresql://user:password@localhost:5432/buildmaster?schema=public"');
} else {
  console.log('Switched Prisma schema to SQLite.');
  console.log('Ensure your .env has DATABASE_URL="file:./dev.db"');
}
