// PAGE LOADER
//
// Shown while a route's code or its first batch of data is still coming. It
// covers the page rather than sitting in a corner, so there is never a moment
// where half the screen is real and half is empty — which is what made the
// site feel slow even when it was not.
//
// It waits 180ms before appearing. A fast response should not produce a flash
// of spinner, which reads as jank rather than speed.

import { useEffect, useState } from 'react';

export default function PageLoader({ label = 'Loading', sub = '', delay = 180, inline = false }) {
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!show) return null;

  return (
    <div className={inline ? 'page-loader is-inline' : 'page-loader'} role="status" aria-live="polite">
      <div className="page-loader-mark" aria-hidden="true">
        {/* A blood drop that fills and empties: the site's own mark, not a
            generic spinner, so the wait still looks like this product. */}
        <svg viewBox="0 0 48 60" width="48" height="60">
          <defs>
            <clipPath id="pl-drop">
              <path d="M24 2C24 2 6 24 6 36a18 18 0 0 0 36 0C42 24 24 2 24 2Z" />
            </clipPath>
          </defs>
          <path d="M24 2C24 2 6 24 6 36a18 18 0 0 0 36 0C42 24 24 2 24 2Z"
                fill="none" stroke="currentColor" strokeWidth="2.5" opacity=".28" />
          <g clipPath="url(#pl-drop)">
            <rect className="page-loader-fill" x="0" y="0" width="48" height="60" fill="currentColor" />
          </g>
        </svg>
      </div>
      <p className="page-loader-label">{label}<span className="page-loader-dots" aria-hidden="true" /></p>
      {sub && <p className="page-loader-sub">{sub}</p>}
    </div>
  );
}
