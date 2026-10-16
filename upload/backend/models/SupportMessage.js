// "supportmessages" collection — a question asked through the site's chat,
// and the administrator's reply to it.
//
// The chat widget answers common questions by itself. Anything it cannot
// match becomes one of these: a real question, waiting for a real person in
// the admin console. That is the difference between a help widget and
// support — somebody is accountable for the ones it could not answer.

const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    // Set when the asker was signed in; anonymous visitors can still ask.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Visitor', trim: true },
    contact: { type: String, default: '', trim: true },   // phone or email, optional
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    // Where in the site the question was asked, so whoever answers has context.
    page: { type: String, default: '' },

    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    reply: { type: String, default: '', maxlength: 4000 },
    repliedAt: { type: Date },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // A short random key so an anonymous asker can poll for their own answer
    // without an account, and without being able to read anyone else's.
    threadKey: { type: String, index: true },
  },
  { timestamps: true }
);

supportMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
