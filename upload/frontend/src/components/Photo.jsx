// One image element for the whole site.
//
// Every photo here is remote, so three things have to be true or the page
// gets worse rather than better:
//   - it must not push the layout around while it loads  -> fixed aspect ratio
//   - it must not block anything above the fold          -> loading="lazy"
//   - it must look deliberate before it arrives, and if
//     it never arrives at all                            -> tinted placeholder
//
// The wrapper keeps its shape from the first paint, so nothing below it jumps.

import { useState } from 'react';
import { photoUrl, photoSrcSet } from '../lib/photos';

export default function Photo({
  photo,
  ratio = '16 / 9',
  className = '',
  sizes = '(max-width: 760px) 100vw, 420px',
  eager = false,
  rounded = true,
}) {
  const [failed, setFailed] = useState(false);
  if (!photo) return null;

  return (
    <div
      className={`photo ${rounded ? 'photo-round' : ''} ${failed ? 'photo-failed' : ''} ${className}`.trim()}
      style={{ aspectRatio: ratio }}
    >
      {!failed && (
        <img
          src={photoUrl(photo, 800)}
          srcSet={photoSrcSet(photo)}
          sizes={sizes}
          alt={photo.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
