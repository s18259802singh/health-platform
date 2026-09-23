// ADMIN > BLOG ARTICLES
// Write / edit / delete articles, moved here from the public Blogs page.
// Cover images are converted to base64 data URLs in the browser.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const emptyForm = { title: '', excerpt: '', content: '', imageUrl: '', author: 'Admin' };
const MAX_IMAGE_MB = 2;

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadBlogs = () => {
    api.get('/blogs').then((res) => setBlogs(res.data));
  };

  useEffect(loadBlogs, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    const { data } = await api.get(`/blogs/${id}`);
    setEditingId(id);
    setForm({ title: data.title, excerpt: data.excerpt, content: data.content, imageUrl: data.imageUrl, author: data.author });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    await api.delete(`/blogs/${id}`);
    loadBlogs();
  };

  return (
    <div className="page">
      <h2>Manage Blog Articles</h2>
      {message && <p className="hint">{message}</p>}

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

      <table className="data-table">
        <thead>
          <tr><th>Title</th><th>Author</th><th>Published</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {blogs.map((b) => (
            <tr key={b._id}>
              <td><Link to={`/blogs/${b._id}`}>{b.title}</Link></td>
              <td>{b.author}</td>
              <td>{new Date(b.createdAt).toLocaleDateString('en-GB')}</td>
              <td>
                <button onClick={() => startEdit(b._id)} className="small-button">Edit</button>
                <button onClick={() => handleDelete(b._id)} className="small-button danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
