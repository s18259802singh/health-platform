// THE BLOG INDEX.
//
// It used to be a grid of picture cards: a cover image, a byline, the title,
// an excerpt and a "Read article" link on each one, three across. Sixteen of
// those is a wall — the pictures are all the same kind of stock scene, so
// they carry no information, and the titles end up as the smallest thing on
// a card that is mostly image.
//
// An index of articles should read like an index: the title, and one line
// saying what it covers. That is what somebody scanning for the piece they
// want actually uses. The pictures are still there inside the articles,
// where they illustrate something.
//
// Writing and editing articles is an administrator task, in the console.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PieceRow from '../components/PieceRow';

const dateShort = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/blogs')
      .then((res) => setBlogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => `${b.title} ${b.excerpt}`.toLowerCase().includes(q));
  }, [blogs, query]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Health blog</p>
          <h1 className="page-h1">Articles on donation, first aid and staying well</h1>
          <p>
            Written for people deciding whether to donate, not for clinicians.
            {blogs.length ? ` ${blogs.length} articles.` : ''}
          </p>
        </div>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search these articles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search articles"
        />
      </div>

      {loading && (
        <ul className="piece-list" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="is-skeleton">
              <span className="sk sk-thumb" />
              <span className="piece-text">
                <span className="sk sk-line w-60" />
                <span className="sk sk-line w-40" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Picture down one side, title and subtitle across the rest, the
          byline out on the far edge. See components/PieceRow.jsx. */}
      <ul className="piece-list">
        {shown.map((b) => (
          <PieceRow
            key={b._id}
            to={`/blogs/${b._id}`}
            title={b.title}
            subtitle={b.excerpt}
            imageUrl={b.imageUrl}
            photoKey={b._id}
            meta={(
              <>
                <b>{b.author}</b>
                <i>{dateShort(b.createdAt)}</i>
                {b.readMinutes ? <i>{b.readMinutes} min read</i> : null}
              </>
            )}
          />
        ))}
      </ul>

      {!loading && shown.length === 0 && (
        <p className="hint">
          {query
            ? 'Nothing matches that. Try a shorter search.'
            : 'No articles published yet.'}
        </p>
      )}
    </div>
  );
}
