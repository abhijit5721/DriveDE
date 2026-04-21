import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

// Database connection string from environment variable
// Format: postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const connectionString = process.env.DATABASE_URL || process.env.DB_URL || process.env.POSTGRES_URL;

console.log('🔍 Checking database connection variables...');
console.log('🔍 Found Env Vars:', Object.keys(process.env).filter(k => k.includes('URL') || k.includes('DATABASE') || k.includes('SUPABASE')));

if (!connectionString) {
  console.log('⚠️ No database connection string found (tried DATABASE_URL, DB_URL, POSTGRES_URL). Skipping migrations.');
  process.exit(0);
}

const sql = postgres(connectionString);

async function migrate() {
  try {
    console.log('🚀 Starting database migrations...');

    // 1. Create a table to track migrations if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS public._migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Read migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ensure order: 001, 002, 003...

    // 3. Get list of already executed migrations
    const executedMigrations = await sql`SELECT name FROM public._migrations`;
    const executedNames = new Set(executedMigrations.map(m => m.name));

    // 4. Run new migrations
    for (const file of files) {
      if (!executedNames.has(file)) {
        console.log(`⏳ Executing: ${file}`);
        const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

        try {
          await sql.begin(async (tx) => {
            await tx.unsafe(content);
            await tx`INSERT INTO public._migrations (name) VALUES (${file})`;
          });
          console.log(`✅ Success: ${file}`);
        } catch (migrationError) {
          const msg = migrationError.message || '';
          if (msg.includes('already exists')) {
            // Objects already exist from a partial run — mark as done and continue
            console.log(`⚠️  ${file}: objects already exist, marking as done and continuing.`);
            await sql`INSERT INTO public._migrations (name) VALUES (${file}) ON CONFLICT DO NOTHING`;
          } else {
            throw migrationError; // Real error - fail the build
          }
        }
      }
    }

    console.log('🏁 Migrations complete!');
  } catch (error) {
    console.error('❌ Migration FAILED:', error.message);
    process.exit(1); // Fail the build
  } finally {
    await sql.end();
  }
}

migrate();
