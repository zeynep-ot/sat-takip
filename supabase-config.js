// Supabase Yapılandırması
// Bu bilgileri Supabase Dashboard'unuzdan alacaksınız

// Free/Demo Account
const SUPABASE_URL = 'https://neqdlevzqfbawhcfzgfy.supabase.co'; // Örnek: https://xxxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcWRsZXZ6cWZiYXdoY2Z6Z2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNTIzMDksImV4cCI6MjA3ODgyODMwOX0.lVUGF8MzHUJwWEwJUFzPRn735Shs5T-zKPsTnY_Xt18'; // Supabase Dashboard > Settings > API > anon public key

// Supabase Client oluştur
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase bağlantısı başlatıldı');