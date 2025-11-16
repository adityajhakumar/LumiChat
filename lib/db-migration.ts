'use server'

import { createClient } from "@/lib/supabase/server"
import { readFileSync } from 'fs'
import { join } from 'path'

export async function initializeDatabase() {
  try {
    const supabase = await createClient()
    
    // Read the SQL migration file
    const sqlPath = join(process.cwd(), 'scripts', '001_create_chat_histories.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec', { sql })
    
    if (error) {
      console.error('[v0] Database migration error:', error)
      return false
    }
    
    console.log('[v0] Database initialized successfully')
    return true
  } catch (error) {
    console.error('[v0] Error in initializeDatabase:', error)
    return false
  }
}

export async function checkAndInitializeDatabase() {
  try {
    const supabase = await createClient()
    
    // Try a simple query to check if table exists
    const { error } = await supabase
      .from('chat_histories')
      .select('count', { count: 'exact' })
      .limit(0)
    
    // If table doesn't exist, initialize it
    if (error?.code === 'PGRST205' || error?.message?.includes('Could not find the table')) {
      console.log('[v0] Table not found, initializing database...')
      return await initializeDatabase()
    }
    
    return true
  } catch (error) {
    console.error('[v0] Error checking database:', error)
    return false
  }
}
