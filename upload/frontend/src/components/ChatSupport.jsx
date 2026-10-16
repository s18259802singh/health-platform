// LIVE CHAT SUPPORT
//
// A support panel that answers the questions this site actually gets asked —
// eligibility, the 90-day wait, how to find stock, how the QR profile works,
// what happens at a camp — and hands off to a phone number and an email for
// anything it cannot answer.
//
// WHAT THIS IS AND IS NOT: there is no human on the other end and no third
// party embedded. It is an on-site assistant that matches a question against
// a known set of answers, plus a clearly-labelled handoff. It says so in its
// first message, because a widget that implies a person is waiting when
// nobody is will cost more trust than it earns.
//
// Everything runs in the browser: no script from another company, nothing
// about the visitor leaves the page, and nothing is stored on a server. That
// also means it cannot slow the site down or go down separately from it.

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const PHONE = '1910';            // India's national blood helpline
const EMAIL = 'support@lifelink.example';

// Each topic: what to match on, what to say, and where to send them next.
const TOPICS = [
  {
    id: 'eligible',
    chip: 'Can I donate?',
    match: /eligib|can i (give|donate)|qualif|allowed|age|weight|how old/i,
    answer: `You can give whole blood if you are 18–65, weigh at least 45 kg and have haemoglobin of 12.5 g/dL or above. The centre checks your haemoglobin with a finger-prick on the day — it takes a minute.\n\nYou will be asked to wait if you have had a fever or infection in the last two weeks, a tattoo or piercing in the last six months, or are pregnant or breastfeeding.`,
    link: { to: '/guides', label: 'Read the full eligibility guide' },
  },
  {
    id: 'wait',
    chip: 'How often can I give?',
    match: /how often|wait|90 day|three month|again|interval|next donation/i,
    answer: `90 days between whole blood donations. That is the time your body needs to replace the red cells — the plasma is back within about 24 hours.\n\nIf you are signed in, your dashboard counts the days down for you.`,
    link: { to: '/dashboard', label: 'Check my next donation date' },
  },
  {
    id: 'stock',
    chip: 'Find blood near me',
    match: /stock|availab|blood bank|near me|find blood|units|where can i get/i,
    answer: `The availability page lists every licensed blood bank and hospital in the register with the units each one has recorded, filtered by district and group. No account needed.\n\nAlways ring the centre before you travel — stock moves faster than any portal updates.`,
    link: { to: '/availability', label: 'Search availability' },
  },
  {
    id: 'donors',
    chip: 'Find a donor',
    match: /find (a )?donor|search donor|who can give|compatib|match/i,
    answer: `Search the donor register by group and city. If you are not sure which groups work for the patient, use the compatibility checker at the top — tap the patient's group and the list filters to everyone medically able to give to them.\n\nContact numbers are shown to signed-in members only.`,
    link: { to: '/donors', label: 'Open donor search' },
  },
  {
    id: 'camp',
    chip: 'What happens at a camp?',
    match: /camp|what happens|first time|nervous|scared|hurt|process|how long/i,
    answer: `Registration and a short health questionnaire, the haemoglobin finger-prick, then the donation itself — about 8 to 10 minutes for one unit. Afterwards you sit for 10 minutes with a drink and something to eat.\n\nStart to finish it is usually under 45 minutes. Booking a slot in advance means you skip the queue.`,
    link: { to: '/camps', label: 'Find a camp near me' },
  },
  {
    id: 'qr',
    chip: 'What is the emergency QR?',
    match: /qr|emergency profile|paramedic|accident|scan/i,
    answer: `A QR code you can keep in your wallet or on your phone's lock screen. Scanning it opens a page showing your blood group, allergies and next-of-kin number — and nothing else.\n\nIt does not need an account to read, which is the point: whoever reaches you first can see it.`,
    link: { to: '/profile', label: 'Open my QR profile' },
  },
  {
    id: 'account',
    chip: 'Account and privacy',
    match: /account|privacy|delete|data|phone number|personal|sign up|register/i,
    answer: `Registering is free. Your phone number is shown only to signed-in members searching the register, and only if you opted in as a donor — you can turn that off in your profile at any time.\n\nTo have your record removed entirely, email ${EMAIL} from the address you registered with.`,
    link: { to: '/profile', label: 'Open my profile' },
  },
];

const GREETING = {
  from: 'bot',
  text: `Hello. I am the LifeLink assistant — an automated one, not a person.\n\nI can answer questions about donating, finding blood, camps and your account. For anything urgent, call ${PHONE}.`,
};

const FALLBACK = `I could not match that to anything I know. For a medical question or an urgent request, call ${PHONE} — it is staffed around the clock — or email ${EMAIL}.\n\nYou can also pick one of the topics below.`;

export default function ChatSupport() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([GREETING]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const reply = (topic) => {
    setTyping(true);
    // A beat before answering: an instant wall of text reads as a dump, and
    // people lose where the new message starts.
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, topic
        ? { from: 'bot', text: topic.answer, link: topic.link }
        : { from: 'bot', text: FALLBACK }]);
    }, 420);
  };

  const ask = (text) => {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: 'me', text: q }]);
    setDraft('');
    reply(TOPICS.find((t) => t.match.test(q)));
  };

  const pick = (topic) => {
    setMsgs((m) => [...m, { from: 'me', text: topic.chip }]);
    reply(topic);
  };

  return (
    <>
      <button
        type="button"
        className={`chat-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close support chat' : 'Open support chat'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.8-5a8.3 8.3 0 0 1-.8-3.6 8.4 8.4 0 0 1 8.5-8.4 8.4 8.4 0 0 1 8.5 8.5Z" />
            </svg>
            <span>Help</span>
          </>
        )}
      </button>

      {open && (
        <section className="chat-panel" role="dialog" aria-label="Support chat">
          <header className="chat-head">
            <div>
              <strong>LifeLink support</strong>
              <small><i className="chat-dot" aria-hidden="true" /> Automated assistant · always on</small>
            </div>
            <a className="chat-call" href={`tel:${PHONE}`}>Call {PHONE}</a>
          </header>

          <div className="chat-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>
                <p>{m.text}</p>
                {m.link && (
                  <Link className="chat-msg-link" to={m.link.to} onClick={() => setOpen(false)}>
                    {m.link.label} →
                  </Link>
                )}
              </div>
            ))}
            {typing && (
              <div className="chat-msg bot chat-typing" aria-label="Assistant is typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <div className="chat-chips">
            {TOPICS.map((t) => (
              <button key={t.id} type="button" onClick={() => pick(t)}>{t.chip}</button>
            ))}
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); ask(draft); }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Your question"
            />
            <button type="submit" aria-label="Send" disabled={!draft.trim()}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </>
  );
}
