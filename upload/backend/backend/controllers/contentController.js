// PUBLIC read endpoints for the two content libraries: donor stories and the
// donor guide hub. Writing is admin-only and lives in the console.

const Story = require('../models/Story');
const Guide = require('../models/Guide');

// GET /api/stories?featured=true&limit=
const getStories = async (req, res) => {
  try {
    const { featured = '', limit = '' } = req.query;
    const filter = {};
    if (featured === 'true') filter.featured = true;

    let query = Story.find(filter).select('-body').sort({ featured: -1, createdAt: -1 });
    if (limit) query = query.limit(Math.min(50, parseInt(limit, 10) || 12));

    res.json(await query);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/stories/:id
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/guides  - returns the whole library grouped by category, which is
// exactly how the guide hub renders it, so the page needs a single request.
const getGuides = async (req, res) => {
  try {
    const guides = await Guide.find().select('-body').sort({ category: 1, order: 1 });

    const grouped = Guide.CATEGORIES.map((category) => ({
      category,
      items: guides.filter((g) => g.category === category),
    }));

    res.json({ categories: grouped, total: guides.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/guides/:id
const getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    // Offer the next guide in the same category so readers keep going.
    const next = await Guide.findOne({ category: guide.category, order: { $gt: guide.order } })
      .select('title summary')
      .sort({ order: 1 });

    res.json({ guide, next });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStories, getStoryById, getGuides, getGuideById };
