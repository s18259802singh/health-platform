// "blogs" collection - health awareness articles written by the admin.
// The cover image is stored the same way as the emergency QR: as a base64
// data URL inside the document itself. This works on Render, whose file
// system is wiped on every redeploy, so we never save image files to disk.

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    // A one-or-two line summary shown on the blog list page.
    excerpt: { type: String, required: true, trim: true },
    // Full article text. Paragraphs are separated by a blank line;
    // the frontend splits on blank lines and renders each as a <p>.
    content: { type: String, required: true },
    // Either a normal image URL (seed data) or a base64 data URL (admin upload).
    imageUrl: { type: String, default: '' },
    author: { type: String, default: 'Admin' },
  },
  { timestamps: true } // createdAt doubles as the "published on" date
);

module.exports = mongoose.model('Blog', blogSchema);
