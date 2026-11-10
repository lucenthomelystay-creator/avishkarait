import { NextRequest, NextResponse } from 'next/server';
import { getTeamByUid, getSiteSettings } from '@/lib/supabase-admin';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { teamUid } = await req.json();

    if (!teamUid) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const team = await getTeamByUid(teamUid);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const settings = await getSiteSettings();
    const feeAmount = settings?.registration_fee || 1500;

    const orderData = await createRazorpayOrder({
      teamUid: team.team_uid,
      teamName: team.team_name,
      amountInr: feeAmount,
    });

    return NextResponse.json({
      success: true,
      order: orderData,
      team: {
        teamUid: team.team_uid,
        teamName: team.team_name,
        teamLeadName: team.team_lead_name,
        teamLeadEmail: team.team_lead_email,
        teamLeadPhone: team.team_lead_phone,
      },
    });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 });
  }
}

