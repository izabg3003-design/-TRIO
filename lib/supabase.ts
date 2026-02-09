
import { createClient } from '@supabase/supabase-js';

// Chaves vindas do ficheiro ou ambiente
const supabaseUrl = 'https://hduhzhgvlfvfhnbtdwrr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdWh6aGd2bGZ2ZmhuYnRkd3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjAyOTQsImV4cCI6MjA4NjIzNjI5NH0.-cCJ0BEhnCagmAf9XOvve4HvPbKXYKWG6B4UwdZYvV8';

// Função para validar URL
const isValidUrl = (url: string) => {
  try { return Boolean(new URL(url)); }
  catch(e) { return false; }
};

// Se as chaves não forem válidas, exportamos um objeto que não quebra o código
export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: { getSession: async () => ({ data: { session: null }, error: null }), signInWithPassword: async () => ({}), signUp: async () => ({}), signOut: async () => ({}) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }), select: () => ({ single: async () => ({ data: null }) }) }), upsert: async () => ({}) }), insert: async () => ({ select: () => ({ single: async () => ({ data: null }) }) }) })
    } as any;
