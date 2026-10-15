// One full blog article - PUBLIC page.
// "Proper blog format": cover image on top, then title, author + date,
// then the content split into real <p> paragraphs (we split on blank lines).

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function BlogPost() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/blogs/${id}`)
      .then((res) => setBlog(res.data))
      .catch(() => setError('Article not found.'));
  }, [id]);

  if (error) return <div className="page"><p className="error-text">{error}</p><Link to="/blogs">← Back to blog</Link></div>;
  if (!blog) return <p>Loading article...</p>;

  // Split the stored text into paragraphs on blank lines.
  const paragraphs = blog.content.split(/\n\s*\n/).filter((p) => p.trim() !== '');

  return (
    <div className="page blog-post">
      <Link to="/blogs" className="blog-back">← All articles</Link>

      {blog.imageUrl && <img className="blog-post-image" src={blog.imageUrl} alt={blog.title} />}

      <h1 className="blog-post-title">{blog.title}</h1>
      <p className="blog-meta">
        By {blog.author} · {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="blog-post-content">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}
