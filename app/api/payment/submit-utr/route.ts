import { NextRequest, NextResponse } from 'next/server';
import { submitStaticQrPayment } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { teamUid, utrReference, screenshotPath } = await req.json();

    if (!teamUid || !utrReference?.trim()) {
      return NextResponse.json(
        { error: 'Valid Team ID and UTR / Transaction Reference number are required.' },
        { status: 400 }
      );
    }

    if (utrReference.trim().length < 6) {
      return NextResponse.json(
        { error: 'Please enter a valid banking UTR transaction reference number.' },
        { status: 400 }
      );
    }

    await submitStaticQrPayment({
      teamUid,
      utrReference: utrReference.trim(),
      screenshotPath,
    });

    return NextResponse.json({
      success: true,
      message: 'UTR submitted successfully. Status updated to PENDING VERIFICATION.',
    });
  } catch (error: any) {
    console.error('Submit UTR Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit payment reference' },
      { status: 500 }
    );
  }
}

