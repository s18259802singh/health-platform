// The story wall - the warm half of the site. Editorial card layout, with the
// featured stories given more room.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ROLE = { donor: 'Donor', recipient: 'Recipient', organiser: 'Organiser' };

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  useEffect(() => {
    api.get('/stories')
      .then((res) => setStories(res.data))
      .finally(() => setLoading(false));
  }, []);

  const shown = role ? stories.filter((s) => s.role === role) : stories;
  const featured = shown.filter((s) => s.featured);
  const rest = shown.filter((s) => !s.featured);

  return (
    <div className="page">
      <p className="app-eyebrow">Stories</p>
      <h2 className="page-title">The reason any of this matters</h2>
      <p className="app-subtext">
        Donors and recipients in their own words. Every one of these started with
        somebody deciding to spend fifteen minutes.
      </p>

      <div className="search-bar">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Everyone</option>
          <option value="donor">Donors</option>
          <option value="recipient">Recipients</option>
          <option value="organiser">Organisers</option>
        </select>
      </div>

      {loading && <p className="hint">Loading stories…</p>}

      {featured.length > 0 && (
        <div className="story-feature-grid">
          {featured.map((s) => (
            <article className="story-feature" key={s._id}>
              <span className={`story-role ${s.role}`}>{ROLE[s.role]}</span>
              <h3><Link to={`/stories/${s._id}`}>{s.headline}</Link></h3>
              <div className="story-byline">
                <span className="story-avatar" aria-hidden="true">{s.name.charAt(0)}</span>
                <span>
                  <strong>{s.name}</strong>
                  <small>{[s.bloodGroup, s.city].filter(Boolean).join(' · ')}</small>
                </span>
              </div>
              <Link className="blog-readmore" to={`/stories/${s._id}`}>Read the story →</Link>
            </article>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="story-grid">
          {rest.map((s) => (
            <article className="story-card" key={s._id}>
              <div className="story-card-head">
                <span className="story-avatar" aria-hidden="true">{s.name.charAt(0)}</span>
                <div>
                  <strong>{s.name}</strong>
                  <small>{[ROLE[s.role], s.bloodGroup, s.city].filter(Boolean).join(' · ')}</small>
                </div>
              </div>
              <h3><Link to={`/stories/${s._id}`}>{s.headline}</Link></h3>
              <Link className="blog-readmore" to={`/stories/${s._id}`}>Read →</Link>
            </article>
          ))}
        </div>
      )}

      {!loading && shown.length === 0 && <p className="hint">No stories published yet.</p>}
    </div>
  );
}
