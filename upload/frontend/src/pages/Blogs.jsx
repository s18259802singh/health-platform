// Health blog - PUBLIC list of articles (anyone can read, even logged out).
// Admins additionally see a form at the bottom to write / edit / delete articles.
// The cover image is picked with a normal file input, converted to a base64
// data URL in the browser (FileReader), and sent inside the JSON body -
// same storage idea as the emergency QR code.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useLang } from '../i18n';
import { useAuth } from '../context/AuthContext';

const emptyForm = { title: '', excerpt: '', content: '', imageUrl: '', author: 'Admin' };
const MAX_IMAGE_MB = 2;

export default function Blogs() {
  const { t } = useLang();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadBlogs = () => {
    api.get('/blogs').then((res) => setBlogs(res.data));
  };

  useEffect(loadBlogs, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Turn the chosen image file into a base64 data URL.
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setMessage(`Image too large - please pick one under ${MAX_IMAGE_MB} MB.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingId) {
        await api.put(`/blogs/${editingId}`, form);
        setMessage('Article updated.');
      } else {
        await api.post('/blogs', form);
        setMessage('Article published.');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadBlogs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save the article.');
    }
  };

  const startEdit = async (id) => {
    // The list endpoint doesn't include full content, so fetch the whole article first.
    const { data } = await api.get(`/blogs/${id}`);
    setEditingId(id);
    setForm({ title: data.title, excerpt: data.excerpt, content: data.content, imageUrl: data.imageUrl, author: data.author });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    await api.delete(`/blogs/${id}`);
    loadBlogs();
  };

  return (
    <div className="page">
      <h2>{t('blogTitle')}</h2>
      <p className="app-subtext">Articles on blood donation, first aid and staying healthy.</p>
      {message && <p className="hint">{message}</p>}

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
              {user?.role === 'admin' && (
                <div className="blog-admin-actions">
                  <button onClick={() => startEdit(b._id)} className="small-button">Edit</button>
                  <button onClick={() => handleDelete(b._id)} className="small-button danger">Delete</button>
                </div>
              )}
            </div>
          </article>
        ))}
        {blogs.length === 0 && <p>No articles published yet.</p>}
      </div>

      {user?.role === 'admin' && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Article' : 'Write a New Article'}</h3>
          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />

            <label>Short Summary (shown on the list page)</label>
            <input name="excerpt" value={form.excerpt} onChange={handleChange} required maxLength={200} />

            <label>Article Content (leave a blank line between paragraphs)</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={10} required />

            <label>Cover Image (max {MAX_IMAGE_MB} MB)</label>
            <input type="file" accept="image/*" onChange={handleImage} />
            {form.imageUrl && <img src={form.imageUrl} alt="Cover preview" className="blog-image-preview" />}

            <label>Author</label>
            <input name="author" value={form.author} onChange={handleChange} />

            <button type="submit">{editingId ? 'Update Article' : 'Publish Article'}</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
