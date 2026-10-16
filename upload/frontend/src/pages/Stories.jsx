// The story wall - the warm half of the site. Editorial card layout, with the
// featured stories given more room.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { LoadMore, useLoadMore } from '../components/Pagination';
import { initials, avatarTint, excerpt } from '../lib/people';
import SearchSelect from '../components/SearchSelect';

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
  const featured = shown.filter((s) => s.featured).slice(0, 3);
  const batch = useLoadMore(shown.filter((s) => !s.featured), 6);
  const rest = batch.slice;
  const TINTS = ['rose', 'sand', 'mint', 'sky', 'slate'];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Stories</p>
          <h1>The reason any of this matters</h1>
          <p>
            Donors and recipients in their own words. Every one of these started
            with somebody deciding to spend fifteen minutes.
          </p>
        </div>
      </div>

      <div className="search-bar">
        <SearchSelect
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Everyone"
          options={[
            { value: '', label: 'Everyone' },
            { value: 'donor', label: 'Donors' },
            { value: 'recipient', label: 'Recipients' },
            { value: 'organiser', label: 'Organisers' },
          ]}
        />
      </div>

      {loading && <p className="hint">Loading stories…</p>}

      {featured.length > 0 && (
        <div className="bento">
          {featured.map((s, i) => (
            <article className={`tile lift t-4 ${TINTS[i % 3]} story-tile`} key={s._id}>
              <span className={`story-role ${s.role}`}>{ROLE[s.role]}</span>
              <h3><Link to={`/stories/${s._id}`}>{s.headline}</Link></h3>
              <p className="story-excerpt">{excerpt(s.body, 150)}</p>
              <div className="story-byline">
                <span className={`story-avatar ${avatarTint(s.name)}`} aria-hidden="true">{initials(s.name)}</span>
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
        <div className="bento">
          {rest.map((s, i) => (
            <article className="tile lift t-4 story-card" key={s._id}>
              <div className="story-card-head">
                <span className={`story-avatar ${avatarTint(s.name)}`} aria-hidden="true">{initials(s.name)}</span>
                <div>
                  <strong>{s.name}</strong>
                  <small>{[ROLE[s.role], s.bloodGroup, s.city].filter(Boolean).join(' · ')}</small>
                </div>
              </div>
              <h3><Link to={`/stories/${s._id}`}>{s.headline}</Link></h3>
              <p className="story-excerpt">{excerpt(s.body)}</p>
              <Link className="blog-readmore" to={`/stories/${s._id}`}>Read →</Link>
            </article>
          ))}
        </div>
      )}

      <LoadMore shown={batch.shown} total={batch.total} hasMore={batch.hasMore} onMore={batch.more} label="more stories" />

      {!loading && shown.length === 0 && <p className="hint">No stories published yet.</p>}
    </div>
  );
}
