// LIVE CHAT SUPPORT — visitor side.
//
// WHAT CHANGED AND WHY
// The first version of this answered by itself: it matched the question
// against a list of canned topics, replied instantly, and only passed on
// what it failed to match. That was wrong. It meant most questions never
// reached a person — the widget answered them and the inbox stayed empty —
// and the visitor was talking to a script while believing they had asked
// the team. Nobody wants a bot standing between them and an answer.
//
// So there is no automated answering here at all. Every message a visitor
// types goes straight to the server, lands in the admin console, and the
// administrator's reply comes back into this same window. The quick buttons
// fill in the box for you to send, nothing more.
//
// HOW THE REPLY GETS BACK
// The window polls its own conversation — 12 seconds while it is open, 45
// while it is shut so the button can show that an answer has arrived. Polling
// rather than websockets: this is a help window, not a trading floor, and a
// socket server is one more thing that can be down at 2am on a free host.

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const PHONE = '1910';                       // India's national blood helpline
const EMAIL = 'support@lifelink.example';
const KEY_STORE = 'lifelink.support.thread';
const POLL_OPEN_MS = 12000;
const POLL_SHUT_MS = 45000;

// Starting points, not answers. Tapping one writes it into the box; the
// visitor still presses send, and a person still reads it.
const STARTERS = [
  'Can I donate?',
  'I need blood near me.',
  'Tell me about the blood camps.',
  'How do I book a slot?',
];

const timeOf = (at) => {
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatSupport() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [wantContact, setWantContact] = useState(false);
  const [haveContact, setHaveContact] = useState(false);
  const [threadKey, setThreadKey] = useState(() => {
    try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; }
  });
  const [unread, setUnread] = useState(0);
  const seenRef = useRef(0);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  // ---------------------------------------------------------------- state --

  // Count the admin messages the visitor has not had on screen, so a closed
  // window can say "there is an answer in here" instead of staying silent.
  const absorb = useCallback((thread, isOpen) => {
    const list = thread?.messages || [];
    setMsgs(list);
    if (thread?.contact) setHaveContact(true);
    const fromTeam = list.filter((m) => m.from === 'admin').length;
    if (isOpen) {
      seenRef.current = fromTeam;
      setUnread(0);
    } else {
      setUnread(Math.max(0, fromTeam - seenRef.current));
    }
  }, []);

  // --------------------------------------------------------------- effects --

  // Stay at the newest message — but not before there is one, or the opening
  // note gets scrolled off the top of a short panel.
  useEffect(() => {
    if (msgs.length && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open, sending]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    seenRef.current = msgs.filter((m) => m.from === 'admin').length;
    setUnread(0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Watch the conversation for the team's replies.
  useEffect(() => {
    if (!threadKey) return undefined;
    let stop = false;
    const check = async () => {
      try {
        const { data } = await api.get(`/support/thread/${threadKey}`);
        if (!stop && data?.messages) absorb(data, open);
      } catch (err) {
        // A 404 means the conversation is gone from the server — most likely
        // a reseed. Forget the key rather than polling a dead thread forever.
        if (err.response?.status === 404) {
          try { localStorage.removeItem(KEY_STORE); } catch { /* private mode */ }
          if (!stop) { setThreadKey(''); setMsgs([]); }
        }
      }
    };
    check();
    const t = setInterval(check, open ? POLL_OPEN_MS : POLL_SHUT_MS);
    return () => { stop = true; clearInterval(t); };
  }, [threadKey, open, absorb]);

  // ----------------------------------------------------------------- send --

  const send = async (text) => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    setDraft('');
    // Show it straight away. The server's copy replaces this a moment later.
    const mine = { from: 'visitor', body, at: new Date().toISOString(), pending: true };
    setMsgs((m) => [...m, mine]);
    try {
      const { data } = await api.post('/support', {
        message: body,
        threadKey: threadKey || undefined,
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        page: window.location.pathname,
      });
      if (data?.threadKey && data.threadKey !== threadKey) {
        try { localStorage.setItem(KEY_STORE, data.threadKey); } catch { /* private mode */ }
        setThreadKey(data.threadKey);
      }
      absorb(data, true);
      setWantContact(false);
    } catch (err) {
      setMsgs((m) => m.filter((x) => x !== mine));
      setDraft(body);
      setError(err.response?.status === 404
        ? `The chat service is not reachable from this server yet. Please call ${PHONE} or email ${EMAIL}.`
        : `That did not send. Check your connection, or call ${PHONE}.`);
    } finally {
      setSending(false);
    }
  };

  const started = msgs.length > 0;
  const waiting = started && msgs[msgs.length - 1]?.from === 'visitor';

  // ----------------------------------------------------------------- view --

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
            {unread > 0 && <i className="chat-fab-badge" aria-label={`${unread} new replies`}>{unread}</i>}
          </>
        )}
      </button>

      {open && (
        <section className="chat-panel" role="dialog" aria-label="Support chat">
          <header className="chat-head">
            <div>
              <strong>Chat with the team</strong>
              <small>
                <i className="chat-dot" aria-hidden="true" />
                {waiting ? 'Sent — waiting for a reply' : 'Answered by the team, not a bot'}
              </small>
            </div>
            <a className="chat-call" href={`tel:${PHONE}`}>Call {PHONE}</a>
          </header>

          <div className="chat-body" ref={bodyRef} aria-live="polite">
            {!started && (
              <div className="chat-intro">
                <strong>Ask us anything about donating or finding blood.</strong>
                <p>
                  Your message goes straight to the LifeLink team — nothing on
                  this line is automated. Replies land right here, so you can
                  close the window and come back to them.
                </p>
                <p className="chat-intro-urgent">
                  If a patient needs blood now, call <a href={`tel:${PHONE}`}>{PHONE}</a> —
                  do not wait on a chat reply.
                </p>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={m._id || `${m.at}-${i}`}
                   className={`chat-msg ${m.from === 'admin' ? 'bot human' : 'me'} ${m.pending ? 'is-pending' : ''}`}>
                {m.from === 'admin' && (
                  <span className="chat-from-team">{m.byName || 'LifeLink team'}</span>
                )}
                <p>{m.body}</p>
                <span className="chat-at">{m.pending ? 'Sending…' : timeOf(m.at)}</span>
              </div>
            ))}

            {waiting && !sending && (
              <div className="chat-pending">
                <span className="chat-pending-dot" aria-hidden="true" />
                With the team. The answer appears here — you can close this window.
              </div>
            )}

            {error && <div className="chat-error" role="alert">{error}</div>}
          </div>

          {/* Who you are: optional, and asked once rather than up front as a
              gate. Most people type the question first and think about how
              they can be reached second. */}
          {(!started || (!haveContact && wantContact)) && (
            <div className="chat-who">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                aria-label="Your name"
              />
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone or email (optional)"
                aria-label="How the team can reach you"
              />
            </div>
          )}

          {started && !haveContact && !wantContact && (
            <button type="button" className="chat-add-contact" onClick={() => setWantContact(true)}>
              Add a phone or email so the team can reach you →
            </button>
          )}

          {!started && (
            <div className="chat-chips">
              {STARTERS.map((s) => (
                <button key={s} type="button"
                        onClick={() => { setDraft(s); inputRef.current?.focus(); }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={started ? 'Write a message…' : 'Type your question…'}
              aria-label="Your message"
            />
            <button type="submit" aria-label="Send" disabled={sending || !draft.trim()}>
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
