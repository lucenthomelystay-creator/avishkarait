import { NextRequest, NextResponse } from 'next/server';
import { getTeamByUid, updatePaymentToPaid, getSiteSettings } from '@/lib/supabase-admin';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { sendPaymentConfirmationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { teamUid, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!teamUid || !razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment verification credentials' }, { status: 400 });
    }

    const team = await getTeamByUid(teamUid);
    if (!team) {
      return NextResponse.json({ error: 'Team record not found' }, { status: 404 });
    }

    // Verify cryptographic signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || '',
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // Update database to PAID
    await updatePaymentToPaid({
      teamId: team.id,
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      transactionRef: razorpay_payment_id,
      method: 'GATEWAY',
    });

    const settings = await getSiteSettings();

    // Trigger confirmation email
    sendPaymentConfirmationEmail({
      teamId: team.id,
      teamUid: team.team_uid,
      teamName: team.team_name,
      eventDomain: team.events?.event_name || team.event_id,
      collegeName: team.college_name,
      teamLead: {
        fullName: team.team_lead_name,
        email: team.team_lead_email,
      },
      participants: (team.participants || []).map((p: any) => ({ fullName: p.participant_name })),
      amountPaid: settings?.registration_fee || 1500,
      transactionRef: razorpay_payment_id,
      paymentDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      hackathonName: settings?.hackathon_name,
    }).catch((err) => {
      console.error('Async payment confirmation email error:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and confirmed successfully',
      teamUid: team.team_uid,
    });
  } catch (error: any) {
    console.error('Verify Gateway Error:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}

