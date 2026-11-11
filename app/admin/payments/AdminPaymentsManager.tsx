'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

type Member = {
  id: string;
  full_name: string;
  email: string;
  github_username: string;
  phone: string;
  is_leader: boolean;
};

type Reg = {
  id: string;
  reference_id: string;
  team_uid: string;
  team_name: string;
  institution: string;
  college: string;
  challenge_id: string;
  registration_status: string;
  payment_status: string;
  payment_reference: string;
  payment_amount: number | null;
  created_at: string;
  domain: { id: string; name: string; slug: string };
  leader: Member | null;
  members: Member[];
};

const PAYMENT_OPTIONS = ['NOT PAID', 'PENDING', 'PAID', 'FAILED'] as const;

export default function AdminPaymentsManager({ registrations }: { registrations: Reg[] }) {
  const [rows, setRows] = useState(registrations);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { payment_status: string; payment_reference: string; payment_amount: string }>>(() => {
    const d: Record<string, { payment_status: string; payment_reference: string; payment_amount: string }> = {};
    for (const r of registrations) {
      d[r.id] = {
        payment_status: r.payment_status || 'NOT PAID',
        payment_reference: r.payment_reference || '',
        payment_amount: r.payment_amount != null ? String(r.payment_amount) : '',
      };
    }
    return d;
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.payment_status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        r.team_name,
        r.team_uid,
        r.reference_id,
        r.institution,
        r.domain.name,
        r.leader?.full_name,
        r.leader?.email,
        r.leader?.phone,
        r.payment_reference,
        ...r.members.map((m) => m.full_name),
        ...r.members.map((m) => m.email),
        ...r.members.map((m) => m.phone),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, statusFilter]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      paid: rows.filter((r) => r.payment_status === 'PAID').length,
      pending: rows.filter((r) => r.payment_status === 'PENDING' || r.payment_status === 'NOT PAID').length,
      failed: rows.filter((r) => r.payment_status === 'FAILED').length,
    }),
    [rows]
  );

  async function save(regId: string) {
    setBusyId(regId);
    setError('');
    setNotice('');
    const draft = drafts[regId];
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          payment_status: draft.payment_status,
          payment_reference: draft.payment_reference || null,
          payment_amount: draft.payment_amount === '' ? null : Number(draft.payment_amount),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Payment details could not be updated.');
      setRows((prev) =>
        prev.map((r) =>
          r.id === regId
            ? {
                ...r,
                payment_status: draft.payment_status,
                payment_reference: draft.payment_reference,
                payment_amount: draft.payment_amount === '' ? null : Number(draft.payment_amount),
              }
            : r
        )
      );
      setNotice('Payment details updated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment details could not be updated.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="section portal-section admin-section">
      <div className="section-label">
        <span>AVISHKAR 2K26 / ADMINISTRATION</span>
        <Link className="text-link" href="/admin">
          Back to admin
        </Link>
      </div>

      <div className="portal-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-line" /> PAYMENT MANAGEMENT
          </span>
          <h1>
            PARTICIPANT
            <br />
            <span>PAYMENTS.</span>
          </h1>
        </div>
        <div className="portal-toolbar">
          <div className="search-wrapper">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search team, participant, UTR..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select select-bordered">
            <option value="all">All payment statuses</option>
            {PAYMENT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="portal-grid admin-counts">
        <div>
          <small>Total Teams</small>
          <strong>{counts.total}</strong>
        </div>
        <div>
          <small>Paid</small>
          <strong>{counts.paid}</strong>
        </div>
        <div>
          <small>Pending / Not Paid</small>
          <strong>{counts.pending}</strong>
        </div>
        <div>
          <small>Failed</small>
          <strong>{counts.failed}</strong>
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" style={{ color: '#16a34a' }}>
          {notice}
        </p>
      )}

      <div className="admin-registration-list">
        {filtered.length === 0 && <p>No registrations match the current filters.</p>}
        {filtered.map((reg) => {
          const draft =
            drafts[reg.id] || {
              payment_status: reg.payment_status,
              payment_reference: reg.payment_reference,
              payment_amount: reg.payment_amount != null ? String(reg.payment_amount) : '',
            };
          return (
            <details className="portal-panel admin-registration" key={reg.id}>
              <summary>
                <span className="admin-summary-info">
                  <span className="admin-team-code">{reg.team_uid || reg.reference_id || '—'}</span>
                  <span>
                    <b>{reg.team_name}</b>
                    <br />
                    <small>
                      {reg.leader?.full_name || 'No leader'} · {reg.leader?.phone || reg.leader?.email || 'No contact'}
                    </small>
                    <br />
                    <small>
                      {reg.domain.name} · {reg.members.length} members
                    </small>
                  </span>
                  <span className="admin-registration-status">{reg.payment_status}</span>
                </span>
              </summary>

              <div className="admin-detail">
                <div className="admin-team-info">
                  <h3>{reg.team_name}</h3>
                  <p>
                    <strong>Team ID:</strong> {reg.team_uid || '—'}
                  </p>
                  <p>
                    <strong>Reference:</strong> {reg.reference_id || '—'}
                  </p>
                  <p>
                    <strong>Domain:</strong> {reg.domain.name}
                  </p>
                  <p>
                    <strong>Challenge:</strong> {reg.challenge_id || 'Pending / on arrival'}
                  </p>
                  <p>
                    <strong>Institution:</strong> {reg.institution || '—'}
                  </p>
                  <p>
                    <strong>College location:</strong> {reg.college || '—'}
                  </p>
                  <p>
                    <strong>Registration status:</strong> {reg.registration_status}
                  </p>
                  <p>
                    <strong>Registered:</strong> {reg.created_at ? new Date(reg.created_at).toLocaleString() : '—'}
                  </p>
                </div>

                <div className="admin-leader-info">
                  <h4>Team Lead &amp; Participants</h4>
                  {reg.members.map((m) => (
                    <div key={m.id} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e5e7e8' }}>
                      <p>
                        <strong>{m.full_name}</strong>
                        {m.is_leader ? ' · Leader' : ''}
                      </p>
                      <p>Email: {m.email || '—'}</p>
                      <p>Phone: {m.phone || '—'}</p>
                      <p>GitHub: {m.github_username || '—'}</p>
                    </div>
                  ))}
                  {!reg.members.length && <p>No participant details available.</p>}
                </div>

                <div className="admin-members-section">
                  <h4>Update Payment</h4>
                  <div className="form" style={{ display: 'grid', gap: 10 }}>
                    <label>
                      Payment status
                      <select
                        value={draft.payment_status}
                        onChange={(e) => setDrafts((d) => ({ ...d, [reg.id]: { ...draft, payment_status: e.target.value } }))}
                      >
                        {PAYMENT_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      UTR / Payment reference
                      <input
                        value={draft.payment_reference}
                        maxLength={100}
                        onChange={(e) => setDrafts((d) => ({ ...d, [reg.id]: { ...draft, payment_reference: e.target.value } }))}
                        placeholder="Transaction reference"
                      />
                    </label>
                    <label>
                      Amount (₹)
                      <input
                        type="number"
                        min={0}
                        value={draft.payment_amount}
                        onChange={(e) => setDrafts((d) => ({ ...d, [reg.id]: { ...draft, payment_amount: e.target.value } }))}
                        placeholder="1500"
                      />
                    </label>
                    <button className="button button-red" type="button" disabled={busyId === reg.id} onClick={() => void save(reg.id)}>
                      {busyId === reg.id ? 'Saving…' : 'Save payment details'}
                    </button>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </main>
  );
}
