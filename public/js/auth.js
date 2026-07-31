import { supabase, SUPABASE_CONFIGURED } from './supabase-config.js';

export async function signUpWithEmail({ fullName, email, password }) {
  if (!SUPABASE_CONFIGURED || !supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  const user = authData?.user;
  if (!user) throw new Error('Signup completed but no user was returned.');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name: fullName,
    email: user.email,
    role: null,
  });

  if (profileError) throw profileError;

  return authData;
}

export async function signInWithEmail({ email, password }) {
  if (!SUPABASE_CONFIGURED || !supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function getUserProfile() {
  if (!SUPABASE_CONFIGURED || !supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!SUPABASE_CONFIGURED || !supabase) return;
  await supabase.auth.signOut();
}

export async function updateUserRole(role) {
  if (!SUPABASE_CONFIGURED || !supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to continue.');

  const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id);
  if (error) throw error;
}
