// A member's own donation record, tier progress, and their certificates.
// The certificate renders to a print-friendly layout, so "Download" is just
// the browser's own print-to-PDF - no extra library, works on every device.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Certificate from '../components/Certificate';

export default function MyDonations() {
  const [data, setData] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/donations/mine')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load your donation record.'));
  }, []);

  const openCertificate = async (id) => {
    try {
      const { data: cert } = await api.get(`/donations/${id}/certificate`);
      setCertificate(cert);
    } catch {
      setError('Could not open that certificate.');
    }
  };

  if (error) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!data) return <p className="hint">Loading your record…</p>;

  const { summary, donations, member } = data;
  const progress = summary.nextTier
    ? Math.round((summary.count / (summary.count + summary.nextTier.needed)) * 100)
    : 100;

  return (
    <div className="page">
      <p className="app-eyebrow">My record</p>
      <h2 className="page-title">Donation history</h2>

      <div className="donor-summary">
        <div className="donor-tier">
          <span className={`tier-badge big ${summary.tier.toLowerCase()}`}>{summary.tier}</span>
          <strong>{member.name}</strong>
          <small>{[member.bloodGroup, member.city].filter(Boolean).join(' · ')}</small>
        </div>

        <div className="donor-stats">
          <div><strong>{summary.count}</strong><span>donations</span></div>
          <div><strong>{summary.units}</strong><span>units</span></div>
          <div className="accent"><strong>{summary.livesTouched}</strong><span>people potentially helped</span></div>
        </div>

        {summary.nextTier && (
          <div className="tier-progress">
            <div className="tier-progress-bar"><span style={{ width: `${progress}%` }} /></div>
            <small>
              {summary.nextTier.needed} more donation{summary.nextTier.needed === 1 ? '' : 's'} to reach{' '}
              <strong>{summary.nextTier.label}</strong>
            </small>
          </div>
        )}
      </div>

      {donations.length === 0 ? (
        <div className="portal-empty">
          <strong>No donations recorded yet</strong>
          <p>
            Donations are added by a blood centre after you give. Once your first one
            is recorded it appears here with a certificate.
          </p>
          <Link to="/camps" className="btn-primary">Find a camp</Link>
        </div>
      ) : (
        <>
          <div className="section-header"><h3>Every donation</h3></div>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Date</th><th>Group</th><th>Units</th><th>Where</th><th>Certificate</th></tr>
            </thead>
            <tbody>
              {donations.map((d, i) => (
                <tr key={d._id}>
                  <td>{donations.length - i}</td>
                  <td>{new Date(d.donatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><span className="blood-badge">{d.bloodGroup}</span></td>
                  <td>{d.units}</td>
                  <td>{d.locationName || d.hospitalId?.name || d.campId?.title || '—'}</td>
                  <td>
                    <button type="button" className="small-button" onClick={() => openCertificate(d._id)}>
                      View certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {certificate && <Certificate data={certificate} onClose={() => setCertificate(null)} />}
    </div>
  );
}
