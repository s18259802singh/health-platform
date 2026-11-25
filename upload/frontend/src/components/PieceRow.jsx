// ONE ROW IN AN INDEX OF THINGS TO READ.
//
// Used by the blog index, the guide library and the "keep reading" list at
// the foot of an article, so all three look and behave the same.
//
// The row uses the full width of the page on purpose. A title and a single
// line of subtitle left most of a 1400px row empty, which is what made the
// listing look unfinished however tidy it was. So the row now runs:
//
//     [ picture ]   title                             meta
//                   one line of subtitle
//
// — a picture down one side, the writing across the rest, and the reading
// time out on the far edge. Both sides of the row are doing something.
//
// The picture is a thumbnail, not a hero: it is there to give the eye
// something to travel down and to tell the rows apart at a glance. The title
// is still the biggest thing in the row, which is the part that matters.

import { Link } from 'react-router-dom';
import Photo from './Photo';
import { photoFor } from '../lib/photos';

export default function PieceRow({
  to,
  title,
  subtitle,
  meta,
  // An article may carry its own cover (the blog's are illustrations stored
  // as data URLs). Anything without one gets a stable scene photo chosen
  // from its id, so the same guide always shows the same picture rather
  // than shuffling on every render.
  imageUrl = '',
  photoKey = '',
}) {
  return (
    <li>
      <Link to={to}>
        <span className="piece-thumb" aria-hidden="true">
          {imageUrl
            ? <img src={imageUrl} alt="" loading="lazy" decoding="async" />
            : <Photo photo={photoFor(photoKey || to)} ratio="16 / 10" sizes="190px" />}
        </span>

        <span className="piece-text">
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>

        {meta && <span className="piece-meta">{meta}</span>}
      </Link>
    </li>
  );
}
