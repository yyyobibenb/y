import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";

neonConfig.webSocketConstructor = ws;

// Function to load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (error) {
    console.log('Could not load .env file:', error);
  }
}

// Load environment variables if not already available
if (!process.env.DATABASE_URL) {
  loadEnvFile();
}

if (!process.env.DATABASE_URL) {
  console.error("Available environment variables:", Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB')));
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Function to create support tables if they don't exist
export async function createSupportTables() {
  try {
    // Create support_chats table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        subject TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(10) DEFAULT 'normal',
        assigned_admin_id UUID REFERENCES users(id),
        last_message_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create support_messages table if not exists  
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id UUID NOT NULL REFERENCES support_chats(id),
        sender_id UUID NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        is_admin_reply BOOLEAN DEFAULT false,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Support tables created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating support tables:', error);
  }
}

// Auto-create tables on module load
createSupportTables().catch(console.error);
