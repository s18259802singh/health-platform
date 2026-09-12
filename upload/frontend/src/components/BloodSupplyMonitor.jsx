// LIVE BLOOD SUPPLY MONITOR
// Your backend already had a real aggregation endpoint for this
// (GET /api/stats/blood-supply, in statsController.js) - it just was never
// mounted in server.js or called from anywhere. This widget finally uses it:
// for each blood group, it shows the real number of willing donors against
// the real number of still-open requests. A group with more open requests
// than donors is a live shortage, and its bag pulses red to say so.

import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function BloodSupplyMonitor() {
  const [supply, setSupply] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/stats/blood-supply')
      .then((res) => setSupply(res.data))
      .catch(() => setError(true));
  }, []);

  if (error) return null;
  if (!supply) return <p className="hint">Loading live blood supply...</p>;

  const maxDonors = Math.max(1, ...supply.map((s) => s.donors));

  return (
    <>
      <div className="section-header">
        <h3>Live Blood Supply</h3>
      </div>
      <p className="supply-caption">
        Willing donors registered per blood group, straight from the database. A pulsing bag means open requests outnumber donors right now - a real shortage.
      </p>
      <div className="supply-row">
        {supply.map((s) => {
          const shortage = s.pendingRequests > s.donors;
          const fillPct = Math.round((s.donors / maxDonors) * 100);
          return (
            <div key={s.group} className={`supply-bag ${shortage ? 'shortage' : ''}`}>
              <div className="supply-bag-shape">
                <div className="supply-bag-fill" style={{ height: `${Math.max(8, fillPct)}%` }} />
              </div>
              <span className="supply-bag-group">{s.group}</span>
              <span className="supply-bag-count">{s.donors} donor{s.donors === 1 ? '' : 's'}</span>
              {s.pendingRequests > 0 && (
                <span className="supply-bag-needed">{s.pendingRequests} needed</span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
