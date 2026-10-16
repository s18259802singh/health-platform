import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { initials, avatarTint } from '../lib/people';

const ROLE = { donor: 'Donor', recipient: 'Recipient', organiser: 'Organiser' };

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/stories/${id}`)
      .then((res) => setStory(res.data))
      .catch(() => setError('Story not found.'));
  }, [id]);

  if (error) return <div className="page"><p className="error-text">{error}</p><Link to="/stories">← All stories</Link></div>;
  if (!story) return <p className="hint">Loading…</p>;

  return (
    <article className="page story-read">
      <Link to="/stories" className="blog-back">← All stories</Link>

      <span className={`story-role ${story.role}`}>{ROLE[story.role]}</span>
      <h1 className="blog-post-title">{story.headline}</h1>

      <div className="story-byline large">
        <span className={`story-avatar ${avatarTint(story.name)}`} aria-hidden="true">{initials(story.name)}</span>
        <span>
          <strong>{story.name}</strong>
          <small>{[story.bloodGroup, story.city].filter(Boolean).join(' · ')}</small>
        </span>
      </div>

      <div className="blog-post-content">
        {story.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="story-cta">
        <h3>Your fifteen minutes could be someone's story.</h3>
        <Link to="/camps" className="btn-primary">Find a camp near you</Link>
      </div>
    </article>
  );
}
