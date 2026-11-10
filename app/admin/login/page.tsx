'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected. Check credentials.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-brand-red text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
          Administrator Login
        </h2>
        <p className="mt-2 text-xs text-brand-grey uppercase tracking-widest">
          National Level Hackathon 2K26 Control Plane
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white text-black p-8 sm:p-10 border-t-4 border-brand-red shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-brand-red text-white text-xs font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                Administrator Email <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@institution.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
                />
                <Mail className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                Secure Password <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
                />
                <Lock className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 py-4 bg-brand-red hover:bg-brand-darkred text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-grey text-center text-xs text-black/60">
            <Link href="/" className="hover:text-black uppercase font-semibold">
              Return to Public Website
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-brand-grey/60">
            Authorized personnel only. All access attempts are cryptographically audited.
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-brand-grey/60">
          Authorized personnel only. All access attempts are cryptographically audited.
        </div>
      </div>
    </div>
  );
}