// Health blog - PUBLIC list of articles (anyone can read, even logged out).
// Writing and editing now lives in the Admin Panel (/admin/blogs).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useLang } from '../i18n';

export default function Blogs() {
  const { t } = useLang();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get('/blogs').then((res) => setBlogs(res.data));
  }, []);

  return (
    <div className="page">
      <h2>{t('blogTitle')}</h2>
      <p className="app-subtext">Articles on blood donation, first aid and staying healthy.</p>

      <div className="blog-grid">
        {blogs.map((b) => (
          <article key={b._id} className="blog-card">
            {b.imageUrl && (
              <Link to={`/blogs/${b._id}`}>
                <img className="blog-card-image" src={b.imageUrl} alt={b.title} loading="lazy" />
              </Link>
            )}
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
        {blogs.length === 0 && <p>No articles published yet.</p>}
      </div>
    </div>
  );
}
