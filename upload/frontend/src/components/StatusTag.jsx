// STATUS TAG
//
// Every status on the site is shown by this one component, so "pending" is
// the same amber everywhere it appears — the requests board, the console, a
// member's dashboard — rather than each page inventing its own badge.
//
// The colours carry meaning, so none of them is the only signal: each tag
// also has a dot and a word, which is what a colour-blind reader relies on.

const TONES = {
  // waiting on somebody
  pending:   { tone: 'warn', label: 'Pending' },
  open:      { tone: 'warn', label: 'Needs an answer' },
  upcoming:  { tone: 'info', label: 'Upcoming' },

  // done, well
  fulfilled: { tone: 'good', label: 'Fulfilled' },
  confirmed: { tone: 'good', label: 'Confirmed' },
  completed: { tone: 'good', label: 'Completed' },
  answered:  { tone: 'good', label: 'Answered' },
  issued:    { tone: 'good', label: 'Issued' },

  // stopped
  cancelled: { tone: 'dead', label: 'Cancelled' },
  closed:    { tone: 'dead', label: 'Closed' },
  expired:   { tone: 'dead', label: 'Expired' },
};

export default function StatusTag({ status, label, tone, size = 'md' }) {
  const key = String(status || '').toLowerCase();
  const known = TONES[key];
  const useTone = tone || known?.tone || 'neutral';
  const text = label || known?.label || (status ? key.charAt(0).toUpperCase() + key.slice(1) : 'Unknown');

  return (
    <span className={`status-tag tone-${useTone} ${size === 'sm' ? 'is-sm' : ''}`.trim()}>
      <i aria-hidden="true" />
      {text}
    </span>
  );
}

export { TONES as STATUS_TONES };
