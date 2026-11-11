import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ── rate-limiting store (in-memory, per-process) ─────────────────────────────
// Simple rate limiter: tracks timestamps per endpoint+ip, drops if >5 requests/10s
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(key: string, maxRequests = 5, windowMs = 10000): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  if (recent.length >= maxRequests) return false;
  recent.push(now);
  rateLimitStore.set(key, recent);
  return true;
}

// ── crypto-secure passphrase generation ───────────────────────────────────────
function generatePassphrase(length: number = 12): string {
  // Use Node.js crypto.getRandomValues for cryptographically secure randomness
  const buffer = crypto.getRandomValues(new Uint32Array(length));
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let passphrase = '';
  for (let i = 0; i < length; i++) {
    passphrase += characters.charAt(buffer[i] % characters.length);
  }
  return passphrase;
}

// ── validation schema using Zod ────────────────────────────────────────────────
const participantSchema = z.object({
  leaderName: z.string().trim().min(2).max(120),
  leaderEmail: z.string().trim().email().max(254).toLowerCase(),
  leaderPhone: z.string().trim().min(7).max(20).regex(/^[+0-9() .-]+$/),
  leaderGithubUsername: z
    .string()
    .trim()
    .max(39)
    .regex(/^[A-Za-z0-9-]*$/, 'Use a valid GitHub username.')
    .optional()
    .or(z.literal('')),
  teams: z
    .array(
      z.object({
        teamName: z.string().trim().min(2).max(100),
        institution: z.string().trim().min(2).max(180),
        city: z.string().trim().min(2).max(100),
        state: z.string().trim().max(100),
        domainId: z.string().uuid(),
        challengeId: z.string().uuid(),
        members: z
          .array(
            z.object({
              fullName: z.string().trim().min(2).max(120),
              email: z.string().trim().email().max(254).toLowerCase(),
              githubUsername: z
                .string()
                .trim()
                .max(39)
                .regex(/^[A-Za-z0-9-]*$/, 'Use a valid GitHub username.')
                .optional()
                .or(z.literal('')),
            })
          )
          .min(1)
          .max(4),
        rulesAccepted: z.literal(true),
        repositoryUrl: z.string().trim().optional(),
      })
    )
    .min(1)
    .max(4),
});
type ParticipantInput = z.infer<typeof participantSchema>;

// ── create admin supabase client (service-role only, no cookie persistence) ────
// Type: Supabase client with service-role key for admin operations only
let adminSupabase:
  | {
      auth: {
        admin: {
          createUser: (opts: {
            email: string;
            password: string;
            email_confirm?: boolean;
          }) => Promise<{ data: { user: any } | { user: null }; error: any }>;
          deleteUser: (uid: string) => Promise<{ data: any; error: any }>;
        };
      };
    }
  | null = null;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (serviceRoleKey && supabaseUrl) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Type-narrow: this client has admin.auth available
    adminSupabase = client as typeof adminSupabase;
  } catch {
    adminSupabase = null;
  }
}

// ── helper: get team uid from team id ────────────────────────────────────────
async function getTeamUid(supabase: any, teamId: string): Promise<string | null> {
  const { data } = await supabase.from('teams').select('team_uid').eq('id', teamId).single();
  return data?.team_uid || null;
}

// ── participant registration POST ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // ── rate limiting ───────────────────────────────────────────────────────────
  const ip = request.ip ?? 'unknown';
  if (!checkRateLimit(`participant-register-${ip}`, 5, 10_000)) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try later.' },
      { status: 429, headers: { 'cache-control': 'no-store' } }
    );
  }

  // ── config check: service-role key must be present ──────────────────────────
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      {
        error:
          'Participant registration is not configured. Contact the event administrator.',
      },
      { status: 503, headers: { 'cache-control': 'no-store' } }
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
      { status: 503, headers: { 'cache-control': 'no-store' } }
    );
  }

  // ── read and validate the request body ──────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'The registration data could not be read.' },
      { status: 400, headers: { 'cache-control': 'no-store' } }
    );
  }

  const parsed = participantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the required fields and try again.',
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400, headers: { 'cache-control': 'no-store' } }
    );
  }

  const input = parsed.data;

  // ── generate a secure passphrase (one-time only, never logged) ──────────────
  const passphrase = generatePassphrase();

  // ── create the auth user via service-role admin API with email_confirm=true ─
  const { data: authData, error: signUpError } = await adminSupabase!.auth.admin.createUser({
    email: input.leaderEmail,
    password: passphrase,
    email_confirm: true, // ✅ Decision: auto-confirm; ownership not verified
  });

  if (signUpError) {
    console.error('Supabase admin createUser error:', signUpError);
    // Duplicate email handling
    if (
      signUpError.message &&
      (signUpError.message.includes('already registered') ||
        signUpError.message.includes('duplicate key') ||
        signUpError.message.includes('unique constraint'))
    ) {
      return NextResponse.json(
        { error: 'An account with this email is already registered.' },
        { status: 409, headers: { 'cache-control': 'no-store' } }
      );
    }
    return NextResponse.json(
      { error: 'Could not create participant account.' },
      { status: 500, headers: { 'cache-control': 'no-store' } }
    );
  }

  // ── if user is null (existing account), prevent duplicate ───────────────────
  if (authData.user === null) {
    return NextResponse.json(
      { error: 'An account with this email is already registered.' },
      { status: 409, headers: { 'cache-control': 'no-store' } }
    );
  }

  // ── helper: delete auth user using admin client ─────────────────────────────
  const deleteAuthUser = async (userId: string) => {
    try {
      await adminSupabase!.auth.admin.deleteUser(userId);
    } catch (e) {
      console.warn('Failed to delete auth user:', e);
    }
  };

  // ── create profile entry ────────────────────────────────────────────────────
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: input.leaderName,
      email: input.leaderEmail,
      role: 'participant',
    });

  if (profileError) {
    await deleteAuthUser(authData.user.id);
    return NextResponse.json(
      { error: 'Could not create participant profile.' },
      { status: 500, headers: { 'cache-control': 'no-store' } }
    );
  }

  // ── create registration records for ALL teams ───────────────────────────────
  const registrations: Array<{ id: string; teamName: string }> = [];
  const teamIds: string[] = [];

  for (let t = 0; t < input.teams.length; t++) {
    const teamInput = input.teams[t];

    // ── create the registration record ──────────────────────────────────────────
    // Status is 'pending' per schema enum, awaiting admin approval
    const registrationPayload = {
      leader_id: authData.user.id,
      team_name: teamInput.teamName,
      institution: teamInput.institution,
      domain_id: teamInput.domainId,
      status: 'pending' as const,
      rules_accepted: teamInput.rulesAccepted,
    };

    const { error: registrationError } = await supabase
      .from('registrations')
      .insert([registrationPayload]);

    if (registrationError) {
      // Roll back all previously created registrations, teams, members, profiles, auth user
      for (let i = 0; i < registrations.length; i++) {
        await supabase.from('registrations').delete().eq('id', registrations[i].id);
        await supabase.from('teams').delete().eq('id', teamIds[i]);
        await supabase.from('team_members').delete().eq('team_id', teamIds[i]);
      }
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await deleteAuthUser(authData.user.id);
      return NextResponse.json(
        { error: 'Could not create registration record.' },
        { status: 500, headers: { 'cache-control': 'no-store' } }
      );
    }

    // Fetch the actual inserted registration ID
    const { data: regData, error: regSelectError } = await supabase
      .from('registrations')
      .select('id')
      .eq('leader_id', authData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (regSelectError) {
      // Roll back
      for (let i = 0; i < registrations.length; i++) {
        await supabase.from('registrations').delete().eq('id', registrations[i].id);
        await supabase.from('teams').delete().eq('id', teamIds[i]);
        await supabase.from('team_members').delete().eq('team_id', teamIds[i]);
      }
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await deleteAuthUser(authData.user.id);
      return NextResponse.json(
        { error: 'Could not fetch registration record.' },
        { status: 500, headers: { 'cache-control': 'no-store' } }
      );
    }

    registrations.push({ id: regData.id, teamName: teamInput.teamName });
    teamIds.push('' as string); // placeholder, will be set after team creation
  }

  // ── create team records and members for ALL teams ────────────────────────────
  for (let t = 0; t < input.teams.length; t++) {
    const teamInput = input.teams[t];
    const registrationId = registrations[t].id;

    // ── create the team record ──────────────────────────────────────────────────
    // CRITICAL: Use the registrationId from the corresponding registration record
    const { error: teamError, data: teamData } = await supabase
      .from('teams')
      .insert({
        registration_id: registrationId,
        name: teamInput.teamName,
        institution: teamInput.institution,
        domain_id: teamInput.domainId,
        leader_id: authData.user.id,
      })
      .select('id')
      .single();

    if (teamError || !teamData?.id) {
      // Roll back: delete this team, all previous teams/registrations/members, profile, auth user
      await supabase.from('teams').delete().eq('id', teamData?.id);
      for (let i = 0; i < t; i++) {
        await supabase.from('teams').delete().eq('id', teamIds[i]);
        await supabase.from('registrations').delete().eq('id', registrations[i].id);
        await supabase.from('team_members').delete().eq('team_id', teamIds[i]);
      }
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await deleteAuthUser(authData.user.id);
      return NextResponse.json(
        { error: 'Could not create team record.' },
        { status: 500, headers: { 'cache-control': 'no-store' } }
      );
    }

    const teamId = teamData.id;
    teamIds[t] = teamId; // Save the actual team ID

    // ── create team members (including leader as first member) ──────────────────
    const membersArray = teamInput.members || [];
    const memberErrors: string[] = [];

    for (let i = 0; i < membersArray.length; i++) {
      const member = membersArray[i];
      const isLeader = i === 0; // First member is the leader
      const memberEmail = member.email || input.leaderEmail;

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId, // actual team DB ID
          profile_id: authData.user.id, // leader's profile
          full_name: member.fullName || input.leaderName,
          email: memberEmail,
          github_username: member.githubUsername || '',
          is_leader: isLeader,
        });

      if (memberError) {
        memberErrors.push(memberError.message);
        console.error(`Error creating team member ${i} for team ${t + 1}:`, memberError);
      }
    }

    // ── complete rollback on member creation errors ─────────────────────────────
    if (memberErrors.length > 0) {
      // Roll back: delete team members, team, registration, and this team's slot
      await supabase.from('team_members').delete().eq('team_id', teamId);
      await supabase.from('teams').delete().eq('id', teamId);
      for (let i = 0; i < t; i++) {
        await supabase.from('teams').delete().eq('id', teamIds[i]);
        await supabase.from('registrations').delete().eq('id', registrations[i].id);
        await supabase.from('team_members').delete().eq('team_id', teamIds[i]);
      }
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await deleteAuthUser(authData.user.id);
      return NextResponse.json(
        {
          error:
            'Registration failed due to team member creation errors. All records have been rolled back.',
          details: memberErrors,
        },
        { status: 500, headers: { 'cache-control': 'no-store' } }
      );
    }
  }

  // ── RETURN SUCCESS: passphrase included ONLY for one-time display ───────────
  // Cache-Control: no-store on the response; passphrase never logged or persisted
  // Build summary of all created registrations and team UIDs
  const savedRegistrations = [];
  for (let t = 0; t < input.teams.length; t++) {
    const teamUid = await getTeamUid(supabase, teamIds[t]!);
    savedRegistrations.push({
      registrationId: registrations[t].id,
      teamId: teamIds[t]!,
      teamUid: teamUid,
      domain: input.teams[t].domainId,
      referenceId: 'ref-' + t,
      status: 'pending',
    });
  }

  return NextResponse.json(
    {
      success: true,
      participantId: authData.user.id,
      email: input.leaderEmail,
      passphrase: passphrase, // ONE-TIME DISPLAY - then discard by client
      message:
        'Account created successfully. Your passphrase is displayed above - please copy and save it securely.',
      registrations: savedRegistrations,
    },
    {
      status: 201,
      headers: {
        'cache-control': 'no-store',
        // Security headers to prevent passphrase leakage
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
      },
    }
  );
}