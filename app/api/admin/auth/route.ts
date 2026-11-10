import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function handler(request: Request) {
  const { method } = request;

  if (method === 'POST') {
    try {
      const { action } = await request.json();

      if (action === 'logout') {
        // Clear the admin cookie by setting it to expired
        const cookieStore = await cookies();
        cookieStore.set('hackathon_admin_session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Admin auth error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // GET - check current session
  if (method === 'GET') {
    try {
      const session = await getAdminSession();
      return new Response(JSON.stringify({ authenticated: !!session, email: session?.email }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ authenticated: false, email: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
