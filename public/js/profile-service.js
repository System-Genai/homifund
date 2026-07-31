import { supabase, SUPABASE_CONFIGURED } from './supabase-config.js';

export async function saveRenterProfile(details) {
  if (!SUPABASE_CONFIGURED || !supabase) throw new Error('Supabase is not configured yet.');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to continue.');

  const payload = {
    user_id: user.id,
    move_in_date: details.moveInDate || null,
    monthly_budget_min: details.monthlyBudgetMin || null,
    monthly_budget_max: details.monthlyBudgetMax || null,
    household_size: details.householdSize || null,
    employment_status: details.employmentStatus || null,
    preferred_locations: details.preferredLocations || null,
    pets: details.pets || null,
    bio: details.bio || null,
  };

  const { error } = await supabase.from('renter_profiles').upsert(payload, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function saveLandlordProfile(details) {
  if (!SUPABASE_CONFIGURED || !supabase) throw new Error('Supabase is not configured yet.');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to continue.');

  const payload = {
    user_id: user.id,
    company_name: details.companyName || null,
    landlord_type: details.landlordType || null,
    portfolio_size: details.portfolioSize || null,
    operating_locations: details.operatingLocations || null,
    bio: details.bio || null,
  };

  const { error } = await supabase.from('landlord_profiles').upsert(payload, { onConflict: 'user_id' });
  if (error) throw error;
}
