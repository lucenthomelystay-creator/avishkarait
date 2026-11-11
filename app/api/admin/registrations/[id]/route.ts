import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedContext } from '@/lib/auth/require-user';

const schema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  payment_status: z.enum(['NOT PAID', 'PENDING', 'PAID', 'FAILED']).optional(),
  payment_reference: z.string().trim().max(100).nullable().optional(),
  payment_amount: z.number().min(0).max(1000000).nullable().optional(),
}).refine((v) => v.status || v.payment_status || v.payment_reference !== undefined || v.payment_amount !== undefined, {
  message: 'No fields to update.',
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { supabase, user, role } = await getAuthenticatedContext();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (role !== 'admin') return NextResponse.json({ error: 'Administrator role required.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid update.' }, { status: 400 });

  const data = parsed.data;
  const update: Record<string, unknown> = {};

  if (data.status) {
    update.status = data.status;
    update.reviewed_at = new Date().toISOString();
    update.reviewed_by = user.id;
    update.approved_at = data.status === 'approved' ? new Date().toISOString() : null;
  }
  if (data.payment_status) update.payment_status = data.payment_status;
  if (data.payment_reference !== undefined) update.payment_reference = data.payment_reference || null;
  if (data.payment_amount !== undefined) update.payment_amount = data.payment_amount;

  const { error } = await supabase.from('registrations').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Registration could not be updated.' }, { status: 500 });
  return NextResponse.json({ ok: true, updated: Object.keys(update) });
}
