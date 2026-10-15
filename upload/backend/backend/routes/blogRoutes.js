const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');

// Reading the blog is public - anyone can learn about blood donation.
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Writing is admin-only.
router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;
