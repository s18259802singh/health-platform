// Public health blog. Writing and editing articles is an administrator task
// and now lives in the admin console at /admin/blogs.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blogs')
      .then((res) => setBlogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h2 className="page-title">Health Blog</h2>
      <p className="app-subtext">Articles on blood donation, first aid and staying healthy.</p>

      {loading && <p className="hint">Loading articles…</p>}

      <div className="blog-grid">
        {blogs.map((b) => (
          <article key={b._id} className="blog-card">
            <Link to={`/blogs/${b._id}`} aria-label={b.title}>
              {b.imageUrl
                ? <img className="blog-card-image" src={b.imageUrl} alt="" loading="lazy" />
                : <span className="blog-card-image placeholder" aria-hidden="true" />}
            </Link>
            <div className="blog-card-body">
              <p className="blog-meta">
                {b.author} · {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <h3><Link to={`/blogs/${b._id}`}>{b.title}</Link></h3>
              <p className="blog-excerpt">{b.excerpt}</p>
              <Link className="blog-readmore" to={`/blogs/${b._id}`}>Read article →</Link>
            </div>
          </article>
        ))}
      </div>

      {!loading && blogs.length === 0 && <p className="hint">No articles published yet.</p>}
    </div>
  );
}
