// CONTACT ACTIONS
//
// Call, WhatsApp, email and directions as icon buttons rather than words, so
// a row of them fits in a table cell without pushing the data off screen.
//
// An icon on its own is a guessing game, so each button carries a tooltip and
// a screen-reader label naming both the action and who it reaches. Anything
// without a usable number is simply not rendered — a dead "Call" button is
// worse than no button.

// India's numbers arrive in the register in several shapes: 9876543210,
// 09876543210, +91 98765 43210. WhatsApp needs the country code and no
// punctuation, so normalise once here instead of in every caller.
export const waNumber = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 12 && digits.startsWith('91')) return digits.slice(0, 12);
  return digits;
};

export const isCallable = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length >= 10 && !/^0+$/.test(digits);
};

const IconPhone = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.8 2Z" />
  </svg>
);

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2Zm0 1.9a8.1 8.1 0 1 1-4.1 15.1l-.3-.2-3 .8.8-3-.2-.3A8.1 8.1 0 0 1 12 3.9Zm-2.5 4c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.6 0 1.6-.6 1.8-1.2.2-.6.2-1.1.2-1.2l-.5-.3-1.6-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-2-1.2 7.3 7.3 0 0 1-1.3-1.7c-.2-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.8-1.9c-.2-.4-.4-.4-.6-.4Z" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 7 9 6 9-6" />
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" />
  </svg>
);

export default function ContactActions({
  phone,
  email,
  address,
  name = '',
  message = '',
  size = 'md',
  locked = false,          // signed-out visitors see why, not a dead button
  lockedHint = 'Sign in to see contact details',
}) {
  const who = name ? ` ${name}` : '';
  const callable = isCallable(phone);
  const wa = callable ? waNumber(phone) : '';

  if (locked) {
    return (
      <span className="ca-locked" title={lockedHint}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        {lockedHint}
      </span>
    );
  }

  const nothing = !callable && !email && !address;
  if (nothing) return <span className="ca-none">No contact on file</span>;

  return (
    <span className={`ca ${size === 'sm' ? 'ca-sm' : ''}`.trim()}>
      {callable && (
        <a className="ca-btn ca-call" href={`tel:${String(phone).replace(/\s/g, '')}`}
           title={`Call${who} on ${phone}`} aria-label={`Call${who} on ${phone}`}>
          <IconPhone />
        </a>
      )}
      {wa && (
        <a className="ca-btn ca-wa" target="_blank" rel="noopener noreferrer"
           href={`https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ''}`}
           title={`Message${who} on WhatsApp`} aria-label={`Message${who} on WhatsApp`}>
          <IconWhatsApp />
        </a>
      )}
      {email && (
        <a className="ca-btn ca-mail" href={`mailto:${email}`}
           title={`Email${who} at ${email}`} aria-label={`Email${who} at ${email}`}>
          <IconMail />
        </a>
      )}
      {address && (
        <a className="ca-btn ca-map" target="_blank" rel="noopener noreferrer"
           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
           title={`Directions to${who || ' this address'}`} aria-label={`Directions to${who || ' this address'}`}>
          <IconPin />
        </a>
      )}
    </span>
  );
}
