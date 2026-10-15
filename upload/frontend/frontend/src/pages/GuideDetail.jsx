import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function GuideDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0 });
    api.get(`/guides/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Guide not found.'));
  }, [id]);

  if (error) return <div className="page"><p className="error-text">{error}</p><Link to="/guides">← Guide library</Link></div>;
  if (!data) return <p className="hint">Loading…</p>;

  const { guide, next } = data;

  return (
    <article className="page guide-read">
      <Link to="/guides" className="blog-back">← Guide library</Link>

      <h1 className="blog-post-title">{guide.title}</h1>
      <p className="guide-read-meta">{guide.readMinutes} min read · {guide.summary}</p>

      <div className="blog-post-content">
        {guide.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {next && (
        <Link className="guide-next" to={`/guides/${next._id}`}>
          <span>Next in this series</span>
          <strong>{next.title}</strong>
          <small>{next.summary}</small>
        </Link>
      )}

      <p className="portal-note">
        These guides are general information, not medical advice. The doctor at your
        blood centre confirms your eligibility on the day of donation.
      </p>
    </article>
  );
}
