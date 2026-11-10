import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });

  const { data, error } = await supabase.from('registration_settings').select('minimum_team_size,maximum_team_size').eq('singleton', true).single();
  if (error || !data) return NextResponse.json({ error: 'Registration settings are unavailable.' }, { status: 503 });
  return NextResponse.json({ minimumTeamSize: data.minimum_team_size, maximumTeamSize: data.maximum_team_size });
}
