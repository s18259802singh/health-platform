// A member's own donation record, tier progress, and their certificates.
// The certificate renders to a print-friendly layout, so "Download" is just
// the browser's own print-to-PDF - no extra library, works on every device.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Certificate from '../components/Certificate';
import BloodGroup from '../components/BloodGroup';

export default function MyDonations() {
  const [data, setData] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.get('/donations/mine')
      .then((res) => setData(res.data))
      .catch((err) => {
        // A 404 here means the server is running a build without the donation
        // routes, which is a deployment state rather than a user problem - so
        // say which it is instead of one generic failure message.
        setError(err.response?.status === 404 ? 'missing' : 'failed');
      });
  };

  useEffect(load, []);

  const openCertificate = async (id) => {
    try {
      const { data: cert } = await api.get(`/donations/${id}/certificate`);
      setCertificate(cert);
    } catch {
      setError('Could not open that certificate.');
    }
  };

  if (error) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <p className="app-eyebrow">My record</p>
            <h1 className="page-h1">Donation history</h1>
          </div>
        </div>

        <div className="bento">
          <div className="tile t-12 state-tile">
            <span className="state-icon" aria-hidden="true">!</span>
            <strong>
              {error === 'missing'
                ? 'This part of the service is not available yet'
                : 'We could not load your donation record'}
            </strong>
            <p>
              {error === 'missing'
                ? 'Your donation history lives on the server, and this server is running an older build that does not have it yet. Nothing of yours has been lost.'
                : 'The server did not respond. This is usually temporary — it is worth trying again in a moment.'}
            </p>
            <div className="state-actions">
              <button type="button" className="btn-primary" onClick={load}>Try again</button>
              <Link to="/dashboard" className="btn-secondary">Back to dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="bento">
          <div className="tile t-12 state-tile">
            <span className="state-icon soft" aria-hidden="true">+</span>
            <strong>No donations recorded yet</strong>
            <p>
              A blood centre records your donation after you give, and it appears here
              within a day or two with a downloadable certificate. Your tier and your
              place on the leaderboard both come from these records.
            </p>
            <div className="state-actions">
              <Link to="/camps" className="btn-primary">Find a camp near you</Link>
              <Link to="/guides" className="btn-secondary">Check if I can donate</Link>
            </div>
          </div>
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
                  <td><BloodGroup group={d.bloodGroup} /></td>
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
