// A quiet strip that appears only when the API has been unreachable-slow for
// a couple of seconds — which on this hosting plan means the server is being
// started back up after an idle period. See api/axios.js for the mechanism.
//
// It disappears by itself the moment anything comes back.

import { useEffect, useState } from 'react';
import { onServerWaking } from '../api/axios';

export default function ServerWaking() {
  const [waking, setWaking] = useState(false);
  useEffect(() => onServerWaking(setWaking), []);
  if (!waking) return null;

  return (
    <div className="waking" role="status" aria-live="polite">
      <span className="waking-spin" aria-hidden="true" />
      Waking the server up — the first request after a quiet spell can take up to a minute.
    </div>
  );
}
