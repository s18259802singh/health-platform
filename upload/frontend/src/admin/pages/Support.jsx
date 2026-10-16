// LIVE CHAT INBOX
//
// Every message a visitor sends on the site arrives here — there is no bot
// in front of this filtering them out any more. Each row is a whole
// conversation: what they said, what we said back, in order, with a box at
// the bottom to carry on. Sending a reply puts it straight into the chat
// window the person is looking at, usually within a dozen seconds.
//
// "Needs an answer" means a visitor spoke last. That is the queue; work it
// top down and it empties.

import { useCallback, useEffect, useRef, useState } from 'react';
import adminApi from '../../api/adminApi';
import { usePagination } from '../../components/Pagination';
import { useToast } from '../components/Toast';
import {
  Pagination, PageHeader, Card, Toolbar, SearchInput, Spinner, EmptyState,
  StatCard, Badge,
} from '../components/ui';
import { IconCheck, IconUsers } from '../components/Icons';

const STATUS = [
  { id: 'open', label: 'Needs an answer' },
  { id: 'answered', label: 'Answered' },
  { id: 'closed', label: 'Closed' },
  { id: '', label: 'Everything' },
];

const TONE = { open: 'warn', answered: 'good', closed: 'neutral' };
const STATUS_LABEL = { open: 'Needs an answer', answered: 'Answered', closed: 'Closed' };

const since = (date) => {
  if (!date) return 'just now';
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
};

const stamp = (at) => {
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString([], {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

export default function Support() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('open');
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [failed, setFailed] = useState('');
  // Whichever conversation is being typed into must not be yanked out from
  // under the cursor by the 30-second refresh.
  const typingIn = useRef(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/support', { params: { status, search } });
      setRows((prev) => {
        const held = typingIn.current;
        if (!held) return data.rows;
        // Keep the row being replied to exactly as it is on screen.
        const mine = prev.find((r) => r._id === held);
        return mine ? data.rows.map((r) => (r._id === held ? mine : r)) : data.rows;
      });
      setOpenCount(data.openCount);
      setFailed('');
    } catch (err) {
      setFailed(err.response?.status === 404 ? 'missing-endpoint' : 'error');
      if (!quiet) {
        toast.error(err.response?.status === 404
          ? 'The server has no support endpoint yet — deploy the backend update.'
          : err.response?.data?.message || 'Could not load the inbox.');
      }
    } finally {
      setLoading(false);
    }
  }, [status, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Somebody is sitting watching their chat window, so the inbox refreshes
  // itself rather than waiting for an admin to press reload.
  useEffect(() => {
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, [load]);

  const swap = (id, fresh) =>
    setRows((list) => list.map((r) => (r._id === id ? fresh : r)));

  const send = async (row) => {
    const reply = (drafts[row._id] || '').trim();
    if (!reply) return;
    setBusyId(row._id);
    try {
      const { data } = await adminApi.post(`/admin/support/${row._id}/reply`, { reply });
      swap(row._id, data);
      setDrafts((d) => ({ ...d, [row._id]: '' }));
      typingIn.current = null;
      if (row.status === 'open') setOpenCount((n) => Math.max(0, n - 1));
      toast.success('Sent — it is in their chat window now.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send that reply.');
    } finally {
      setBusyId(null);
    }
  };

  const act = async (row, what) => {
    setBusyId(row._id);
    try {
      const { data } = await adminApi.post(`/admin/support/${row._id}/${what}`);
      swap(row._id, data);
      if (what === 'close' && row.status === 'open') setOpenCount((n) => Math.max(0, n - 1));
      toast.success(what === 'close' ? 'Closed.' : 'Reopened.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'That did not work.');
    } finally {
      setBusyId(null);
    }
  };

  const pager = usePagination(rows, 6);
  const answered = rows.filter((r) => r.status === 'answered').length;

  return (
    <>
      <PageHeader
        title="Live chat"
        subtitle="Every message from the site's chat window. Replying here lands in the visitor's window within seconds."
      />

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconUsers />} label="Waiting on you" value={openCount}
                  tone={openCount > 0 ? 'warn' : 'default'}
                  hint={openCount > 0 ? 'Somebody is watching their window' : 'Queue is clear'} />
        <StatCard icon={<IconCheck />} label="Answered in this view" value={answered} />
        <StatCard icon={<IconUsers />} label="Conversations shown" value={rows.length} tone="accent" />
      </div>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search messages, names, contacts…" />
          <div className="adm-chips">
            {STATUS.map((s) => (
              <button key={s.id} type="button"
                      className={`adm-chip ${status === s.id ? 'on' : ''}`}
                      onClick={() => setStatus(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </Toolbar>

        {loading ? <Spinner /> : failed === 'missing-endpoint' ? (
          <EmptyState
            title="The server does not have this endpoint yet"
            message="This page is part of the backend update. Upload the backend files and let Render finish deploying, then reload — nothing here is broken, the console is simply ahead of the server."
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title={status === 'open' ? 'Nobody waiting' : 'No conversations'}
            message={status === 'open'
              ? 'Every message has been answered. New ones appear here on their own.'
              : 'Nothing matches that filter.'}
          />
        ) : (
          <>
            <ul className="adm-threads">
              {pager.slice.map((row) => {
                const msgs = row.messages || [];
                const last = msgs[msgs.length - 1];
                const fromVisitor = msgs.filter((m) => m.from === 'visitor').length;
                return (
                  <li key={row._id} className={`adm-thread ${row.status}`}>
                    <header>
                      <div>
                        <strong>{row.userId?.name || row.name || 'Visitor'}</strong>
                        <small className="adm-muted">
                          {row.contact || row.userId?.email || row.userId?.phone || 'no contact given'}
                          {row.page && ` · from ${row.page}`}
                          {` · ${fromVisitor} from them`}
                          {` · last ${since(row.lastMessageAt || row.updatedAt)}`}
                        </small>
                      </div>
                      <Badge tone={TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                    </header>

                    <ol className="adm-convo">
                      {msgs.map((m, i) => (
                        <li key={m._id || `${m.at}-${i}`} className={`adm-convo-msg ${m.from}`}>
                          <span className="adm-convo-who">
                            {m.from === 'admin'
                              ? (m.byName || 'You')
                              : (row.userId?.name || row.name || 'Visitor')}
                            <em>{stamp(m.at)}</em>
                          </span>
                          <p>{m.body}</p>
                        </li>
                      ))}
                      {msgs.length === 0 && <li className="adm-muted">No messages in this conversation.</li>}
                    </ol>

                    {row.status === 'closed' ? (
                      <div className="adm-thread-actions">
                        <button type="button" className="adm-btn" disabled={busyId === row._id}
                                onClick={() => act(row, 'reopen')}>
                          Reopen
                        </button>
                      </div>
                    ) : (
                      <div className="adm-thread-reply">
                        <textarea
                          rows={3}
                          value={drafts[row._id] ?? ''}
                          placeholder={last?.from === 'visitor'
                            ? 'Write your reply…'
                            : 'Add something else…'}
                          onFocus={() => { typingIn.current = row._id; }}
                          onBlur={() => { if (!(drafts[row._id] || '').trim()) typingIn.current = null; }}
                          onChange={(e) => setDrafts((d) => ({ ...d, [row._id]: e.target.value }))}
                        />
                        <div className="adm-thread-actions">
                          <button type="button" className="adm-btn" disabled={busyId === row._id}
                                  onClick={() => act(row, 'close')}>
                            Close conversation
                          </button>
                          <button type="button" className="adm-btn primary"
                                  onClick={() => send(row)}
                                  disabled={busyId === row._id || !(drafts[row._id] || '').trim()}>
                            {busyId === row._id ? 'Sending…' : 'Send reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pagination page={pager.page} pages={pager.pages} onChange={pager.setPage} />
          </>
        )}
      </Card>
    </>
  );
}
