// "supportmessages" collection — one live chat conversation.
//
// WHY THIS IS A THREAD, NOT A TICKET
// The first version of this was a question-and-one-answer ticket, fronted by
// a widget that tried to answer by itself and only passed on what it could
// not match. That was the wrong shape twice over: most questions never
// reached a person at all, and the ones that did could not be followed up on
// — there was nowhere to put "which camp did you mean?".
//
// So this is a conversation. Every message a visitor sends lands here, an
// administrator answers in the console, and either side can keep going.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ['visitor', 'admin'], required: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    byId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    byName: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const supportThreadSchema = new mongoose.Schema(
  {
    // Set when the visitor was signed in; anonymous visitors can still chat.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Visitor', trim: true },
    contact: { type: String, default: '', trim: true },
    page: { type: String, default: '' },

    messages: { type: [messageSchema], default: [] },

    // open      - the visitor has said something nobody has answered yet
    // answered  - an administrator spoke last
    // closed    - done with, hidden from the default view
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },

    lastMessageAt: { type: Date, default: Date.now },

    // The only thing that lets an anonymous visitor read their own
    // conversation back, and nobody else's.
    threadKey: { type: String, index: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

supportThreadSchema.index({ status: 1, lastMessageAt: -1 });

// Keep status and ordering in step with whoever spoke last, so the console
// never has to work it out and a thread cannot be "answered" with an
// unanswered question sitting at the bottom of it.
supportThreadSchema.methods.push = function pushMessage(msg) {
  this.messages.push(msg);
  this.lastMessageAt = msg.at || new Date();
  if (this.status !== 'closed') {
    this.status = msg.from === 'visitor' ? 'open' : 'answered';
  }
  return this;
};

module.exports = mongoose.model('SupportMessage', supportThreadSchema);
