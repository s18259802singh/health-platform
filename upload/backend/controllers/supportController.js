// Support messages: the public side (ask a question, read the answer) and the
// member's own history. The administrator side lives in adminController.

const crypto = require('crypto');
const SupportMessage = require('../models/SupportMessage');

// POST /api/support  — public. A signed-in member is recorded; a visitor is not.
const createMessage = async (req, res) => {
  try {
    const { message, name, contact, page } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'A question is required' });
    }

    const doc = await SupportMessage.create({
      userId: req.user?.id,
      name: (name || req.user?.name || 'Visitor').slice(0, 80),
      contact: (contact || '').slice(0, 120),
      message: String(message).trim().slice(0, 2000),
      page: (page || '').slice(0, 120),
      threadKey: crypto.randomBytes(9).toString('hex'),
    });

    // The key is the only thing that lets an anonymous asker read the reply,
    // so it goes back to them and nowhere else.
    res.status(201).json({ threadKey: doc.threadKey, createdAt: doc.createdAt, status: doc.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/support/thread/:key — public, but only ever one thread.
const getThread = async (req, res) => {
  try {
    const doc = await SupportMessage.findOne({ threadKey: req.params.key })
      .select('message reply status createdAt repliedAt');
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/support/mine — a signed-in member's own questions.
const getMine = async (req, res) => {
  try {
    const rows = await SupportMessage.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(20)
      .select('message reply status createdAt repliedAt threadKey');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createMessage, getThread, getMine };
