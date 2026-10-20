// The donation certificate.
// Rendered as real DOM rather than an image, so it prints crisply at any size
// and stays readable to screen readers. "Download" uses the browser's own
// print-to-PDF, which works on desktop and mobile without any library.

import { useEffect } from 'react';
import BloodGroup from './BloodGroup';

export default function Certificate({ data, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const date = new Date(data.donatedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const ordinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="cert-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cert-shell" role="dialog" aria-modal="true" aria-label="Donation certificate">
        <div className="cert-toolbar no-print">
          <button type="button" className="small-button" onClick={() => window.print()}>
            Download / Print
          </button>
          <button type="button" className="small-button" onClick={onClose}>Close</button>
        </div>

        <article className="certificate" id="certificate">
          <div className="cert-border">
            <header className="cert-head">
              <span className="cert-mark" aria-hidden="true" />
              <div>
                <strong>LifeLink</strong>
                <small>Health Emergency &amp; Blood Donor Network</small>
              </div>
            </header>

            <p className="cert-kicker">Certificate of Blood Donation</p>
            <p className="cert-presented">This is to certify that</p>
            <h1 className="cert-name">{data.name}</h1>

            <p className="cert-body">
              voluntarily donated <strong>{data.units}</strong> unit
              {data.units === 1 ? '' : 's'} of <BloodGroup group={data.bloodGroup} variant="bare" /> blood
              on <strong>{date}</strong>
              {data.location ? <> at <strong>{data.location}</strong></> : null}
              {data.city ? <>, {data.city}</> : null}.
            </p>

            <p className="cert-note">
              This was their {ordinal(data.donationNumber)} recorded donation, and may help
              as many as {data.livesTouched} people.
            </p>

            <div className="cert-foot">
              <div>
                <span>Certificate number</span>
                <strong>{data.certificateNo}</strong>
              </div>
              <div className="cert-seal" aria-hidden="true">
                <span>LifeLink</span>
                <small>Verified donation</small>
              </div>
              <div className="cert-sign">
                <span className="cert-sign-line" aria-hidden="true" />
                <small>Authorised signatory</small>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
