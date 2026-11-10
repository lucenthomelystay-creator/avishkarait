import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { getTeamByUid, updatePaymentToPaid, getSiteSettings } from '@/lib/supabase-admin';
import { sendPaymentConfirmationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid && process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const teamUid = orderEntity?.receipt || paymentEntity?.notes?.teamUid;
      if (teamUid) {
        const team = await getTeamByUid(teamUid);
        if (team && team.payments?.[0]?.payment_status !== 'PAID') {
          await updatePaymentToPaid({
            teamId: team.id,
            gatewayOrderId: paymentEntity?.order_id || orderEntity?.id,
            gatewayPaymentId: paymentEntity?.id,
            transactionRef: paymentEntity?.id,
            method: 'GATEWAY',
          });

          const settings = await getSiteSettings();

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
            amountPaid: Number(paymentEntity?.amount ? paymentEntity.amount / 100 : 1500),
            transactionRef: paymentEntity?.id || 'GATEWAY_WEBHOOK',
            paymentDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            hackathonName: settings?.hackathon_name,
          }).catch((err) => console.error('Webhook confirmation email error:', err));
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

