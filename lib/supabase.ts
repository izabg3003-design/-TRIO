
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hduhzhgvlfvfhnbtdwrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdWh6aGd2bGZ2ZmhuYnRkd3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjAyOTQsImV4cCI6MjA4NjIzNjI5NH0.-cCJ0BEhnCagmAf9XOvve4HvPbKXYKWG6B4UwdZYvV8';

let client;
try {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Átrio: Supabase Client preparado.');
} catch (e) {
    console.error('Átrio: Erro ao instanciar Supabase:', e);
    // Fallback dummy client para não crashar o import
    client = {
        auth: { getSession: async () => ({ data: { session: null } }) },
        from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) })
    } as any;
}

export const supabase = client;
