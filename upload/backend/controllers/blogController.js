// Handles: the health blog.
// Reading is PUBLIC (health awareness articles should be readable by anyone).
// Creating / editing / deleting is admin-only (enforced on the routes).

const Blog = require('../models/Blog');

// GET /api/blogs  (PUBLIC) - newest first, without full content (lighter response)
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .select('title excerpt imageUrl author createdAt')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/blogs/:id  (PUBLIC) - one full article
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Article not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/blogs  (admin only)
const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, imageUrl, author } = req.body;
    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: 'title, excerpt and content are required' });
    }
    const blog = await Blog.create({ title, excerpt, content, imageUrl, author });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/blogs/:id  (admin only)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: 'Article not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/blogs/:id  (admin only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
