import { NextRequest, NextResponse } from 'next/server';
import { logVisitor } from '@/lib/supabase-admin';

const requestLog = new Map<string, number[]>();
function allowRequest(key: string) {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 20) return false;
  recent.push(now);
  requestLog.set(key, recent);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip ?? 'unknown';
    if (!allowRequest(ip)) return NextResponse.json({ error: 'Too many analytics requests.' }, { status: 429 });

    const body: unknown = await req.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    const { anonymousVisitorId, pagePath, referralSource, deviceCategory } = body as Record<string, unknown>;
    if (
      typeof anonymousVisitorId !== 'string' || anonymousVisitorId.length < 8 || anonymousVisitorId.length > 128 ||
      typeof pagePath !== 'string' || !pagePath.startsWith('/') || pagePath.startsWith('//') || pagePath.length > 200 ||
      (referralSource != null && (typeof referralSource !== 'string' || referralSource.length > 200)) ||
      (deviceCategory != null && !['desktop', 'mobile', 'tablet'].includes(String(deviceCategory)))
    ) return NextResponse.json({ error: 'Invalid analytics parameters.' }, { status: 400 });

    await logVisitor({
      anonymousVisitorId,
      pagePath,
      referralSource,
      deviceCategory,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

