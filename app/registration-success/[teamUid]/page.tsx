'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, Printer, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Header, Footer } from '@/src/App';

export default function RegistrationSuccessPage({ params }: { params: Promise<{ teamUid: string }> }) {
  const { teamUid } = use(params);
  const [team, setTeam] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/team/lookup?uid=${encodeURIComponent(teamUid)}`);
        const data = await res.json();
        if (!res.ok || !data.team) throw new Error(data.error || 'Team registration not found');
        setTeam(data.team); setSettings(data.settings);
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    })();
  }, [teamUid]);

  if (loading) return <><Header /><main className="utility-page" style={{ textAlign: 'center', paddingTop: 120 }}><Loader2 className="animate-spin" style={{ margin: '0 auto 12px', color: '#D71935' }} /><span className="utility-label">GENERATING REGISTRATION PASS…</span></main><Footer /></>;
  if (error || !team) return <><Header /><main className="utility-page"><div className="info-note"><AlertTriangle size={18} color="#D71935" /> <b>Registration not found.</b> {error}</div><Link href="/" className="button button-red" style={{ marginTop: 16 }}>Back to home</Link></main><Footer /></>;

  const payment = team.payments?.[0] || { payment_status: 'NOT PAID', amount: 1500 };
  const isPaid = payment.payment_status === 'PAID';
  const pill = isPaid ? 'status-pill status-paid' : payment.payment_status === 'PENDING' ? 'status-pill status-pending' : 'status-pill status-unpaid';

  return <>
    <Header />
    <main className="page-content">
      <section className="utility-page">
        <div className="utility-card dark" style={{ borderTop: '4px solid #D71935' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <span className="utility-label">OFFICIAL ADMISSION & REGISTRATION PASS</span>
              <h1 style={{ margin: '8px 0 4px', color: '#fff' }}>{settings?.hackathon_name || 'AVISHKAR 2K26'}</h1>
              <div style={{ color: '#b8c3d2', fontSize: 12 }}>{settings?.institution_name || 'Adichunchanagiri Institute of Technology'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="utility-label">TEAM ID</span>
              <div style={{ font: "800 30px 'Barlow Condensed', sans-serif", color: '#D71935' }}>{team.team_uid}</div>
            </div>
          </div>
        </div>

        <div className="utility-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div><span className="utility-label">PAYMENT STATUS</span> <span className={pill}>{payment.payment_status}</span></div>
          <div><span className="utility-label">REGISTRATION DATE</span><b>{new Date(team.created_at).toLocaleDateString('en-IN')}</b></div>
        </div>

        <div className="utility-card">
          <div className="utility-row">
            <div><span className="utility-label">TEAM NAME</span><div className="utility-value">{team.team_name}</div></div>
            <div><span className="utility-label">INSTITUTION</span><div className="utility-value" style={{ fontSize: 16 }}>{team.college_name}</div></div>
            <div><span className="utility-label">EVENT DOMAIN</span><div className="utility-value" style={{ fontSize: 16 }}>{team.events?.event_name || team.event_id}</div></div>
            <div><span className="utility-label">CHALLENGE</span><div className="utility-value" style={{ fontSize: 16 }}>{team.selected_challenge || 'General'}</div></div>
          </div>
        </div>

        <div className="utility-card">
          <span className="utility-label">REGISTERED TEAM MEMBERS</span>
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <table className="table-clean">
              <thead><tr><th>ROLE</th><th>NAME</th><th>EMAIL</th><th>CONTACT</th></tr></thead>
              <tbody>
                <tr><td style={{ color: '#D71935', fontWeight: 700 }}>Team Lead</td><td><b>{team.team_lead_name}</b></td><td>{team.team_lead_email}</td><td style={{ fontFamily: "'DM Mono',monospace" }}>{team.team_lead_phone}</td></tr>
                {(team.participants || []).map((p: any, i: number) => (
                  <tr key={i}><td>Member {i + 1}</td><td>{p.participant_name}</td><td>{p.participant_email}</td><td style={{ fontFamily: "'DM Mono',monospace" }}>{p.participant_phone}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="info-note">
          <b style={{ display: 'block', marginBottom: 6 }}>Event day instructions</b>
          Present this pass (digital or printed) with college ID cards at registration. Report 30 minutes before the opening session. Label hardware/laptops with your Team ID ({team.team_uid}).
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => window.print()} className="button" style={{ background: '#071935', color: '#fff' }}><Printer size={15} /> Print pass</button>
          {!isPaid && <Link href={`/payment/${team.team_uid}`} className="button button-red">Complete fee (₹{payment.amount || 1500}) <ArrowRight size={15} /></Link>}
          <Link href="/" className="button" style={{ border: '1px solid #dfe2e5' }}>Return home</Link>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
