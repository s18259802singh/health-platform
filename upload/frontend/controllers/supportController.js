// Live chat, visitor side: start a conversation, add to it, read it back.
// The administrator side is in adminContentController.js.

const crypto = require('crypto');
const SupportMessage = require('../models/SupportMessage');

const MAX = 4000;

// What the visitor is allowed to see. Never the internal id, never anybody
// else's thread, and never the fields the console uses for triage.
const publicView = (t) => ({
  threadKey: t.threadKey,
  status: t.status,
  messages: t.messages.map((m) => ({
    from: m.from,
    body: m.body,
    byName: m.from === 'admin' ? (m.byName || 'LifeLink team') : undefined,
    at: m.at,
  })),
  lastMessageAt: t.lastMessageAt,
});

// POST /api/support            { message, name?, contact?, page? }
// POST /api/support            { message, threadKey }   -> adds to that thread
const postMessage = async (req, res) => {
  try {
    const { message, name, contact, page, threadKey } = req.body;
    const body = String(message || '').trim();
    if (!body) return res.status(400).json({ message: 'Type a message first' });

    let thread = threadKey ? await SupportMessage.findOne({ threadKey }) : null;

    if (!thread) {
      thread = new SupportMessage({
        userId: req.user?.id,
        name: (name || req.user?.name || 'Visitor').slice(0, 80),
        contact: (contact || '').slice(0, 120),
        page: (page || '').slice(0, 120),
        threadKey: crypto.randomBytes(12).toString('hex'),
      });
    } else if (thread.status === 'closed') {
      // Somebody coming back to a closed conversation has a new question.
      thread.status = 'open';
    }

    // Let a visitor add their contact details later in the conversation,
    // which is when most people think to offer them.
    if (contact && !thread.contact) thread.contact = String(contact).slice(0, 120);
    if (req.user?.id && !thread.userId) thread.userId = req.user.id;

    thread.push({ from: 'visitor', body: body.slice(0, MAX), at: new Date() });
    await thread.save();

    res.status(201).json(publicView(thread));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/support/thread/:key — polled by the open chat window.
const getThread = async (req, res) => {
  try {
    const thread = await SupportMessage.findOne({ threadKey: req.params.key });
    if (!thread) return res.status(404).json({ message: 'Not found' });
    res.json(publicView(thread));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/support/mine — a signed-in member's own conversations.
const getMine = async (req, res) => {
  try {
    const rows = await SupportMessage.find({ userId: req.user.id })
      .sort({ lastMessageAt: -1 }).limit(10);
    res.json(rows.map(publicView));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { postMessage, getThread, getMine };
