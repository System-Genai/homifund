import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://fmuakouenkjfvyafnmxi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uxh9u7iXMw7aFAU_q3T53g_Rk-BxPBH';

const isConfigured = SUPABASE_URL !== 'PASTE_YOUR_SUPABASE_URL_HERE' && SUPABASE_ANON_KEY !== 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export const SUPABASE_CONFIGURED = isConfigured;
