
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hduhzhgvlfvfhnbtdwrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdWh6aGd2bGZ2ZmhuYnRkd3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjAyOTQsImV4cCI6MjA4NjIzNjI5NH0.-cCJ0BEhnCagmAf9XOvve4HvPbKXYKWG6B4UwdZYvV8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
