// SUPPORT INBOX
// Questions the site's chat could not answer by itself. The widget handles
// the common ones; these are the rest, and somebody here is accountable for
// each of them. Answering one sends the reply straight back into the chat
// window the person asked from.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import { usePagination } from '../../components/Pagination';
import { useToast } from '../components/Toast';
import {
  Pagination, PageHeader, Card, Toolbar, SearchInput, Spinner, EmptyState,
  StatCard, Badge, formatDate,
} from '../components/ui';
import { IconCheck, IconUsers } from '../components/Icons';

const STATUS = [
  { id: '', label: 'Everything' },
  { id: 'open', label: 'Needs an answer' },
  { id: 'answered', label: 'Answered' },
  { id: 'closed', label: 'Closed' },
];

const TONE = { open: 'warn', answered: 'good', closed: 'neutral' };
const STATUS_LABEL = { open: 'Needs an answer', answered: 'Answered', closed: 'Closed' };

const since = (date) => {
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/support', { params: { status, search } });
      setRows(data.rows);
      setOpenCount(data.openCount);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load the inbox.');
    } finally {
      setLoading(false);
    }
  }, [status, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Someone waiting on an answer is watching their chat window, so the inbox
  // refreshes itself rather than relying on the admin pressing reload.
  useEffect(() => {
    const t = setInterval(load, 45000);
    return () => clearInterval(t);
  }, [load]);

  const send = async (row) => {
    const reply = (drafts[row._id] || '').trim();
    if (!reply) return;
    setBusyId(row._id);
    try {
      const { data } = await adminApi.post(`/admin/support/${row._id}/reply`, { reply });
      setRows((list) => list.map((r) => (r._id === row._id ? data : r)));
      setDrafts((d) => ({ ...d, [row._id]: '' }));
      setOpenCount((n) => Math.max(0, n - 1));
      toast.success('Reply sent — it appears in their chat window.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send that reply.');
    } finally {
      setBusyId(null);
    }
  };

  const close = async (row) => {
    setBusyId(row._id);
    try {
      const { data } = await adminApi.post(`/admin/support/${row._id}/close`);
      setRows((list) => list.map((r) => (r._id === row._id ? { ...r, ...data } : r)));
      toast.success('Closed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not close that.');
    } finally {
      setBusyId(null);
    }
  };

  const pager = usePagination(rows, 8);
  const answered = rows.filter((r) => r.status === 'answered').length;

  return (
    <>
      <PageHeader
        title="Support inbox"
        subtitle="Questions the chat could not answer. Replying here sends the answer back into the visitor's chat window."
      />

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconUsers />} label="Needs an answer" value={openCount}
                  tone={openCount > 0 ? 'warn' : 'default'}
                  hint={openCount > 0 ? 'Somebody is waiting' : 'Nothing waiting'} />
        <StatCard icon={<IconCheck />} label="Answered in this view" value={answered} />
        <StatCard icon={<IconUsers />} label="Shown" value={rows.length} tone="accent" />
      </div>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search questions, names, contacts…" />
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

        {loading ? <Spinner /> : rows.length === 0 ? (
          <EmptyState
            title={status === 'open' ? 'Nothing waiting' : 'No messages'}
            message={status === 'open'
              ? 'Every question the chat passed on has been answered.'
              : 'Nothing matches that filter.'}
          />
        ) : (
          <>
            <ul className="adm-threads">
              {pager.slice.map((row) => (
                <li key={row._id} className={`adm-thread ${row.status}`}>
                  <header>
                    <div>
                      <strong>{row.userId?.name || row.name || 'Visitor'}</strong>
                      <small className="adm-muted">
                        {row.contact || row.userId?.email || row.userId?.phone || 'no contact given'}
                        {row.page && ` · asked from ${row.page}`}
                        {` · ${since(row.createdAt)}`}
                      </small>
                    </div>
                    <Badge tone={TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                  </header>

                  <p className="adm-thread-q">{row.message}</p>

                  {row.reply && (
                    <div className="adm-thread-a">
                      <span>
                        Answered{row.repliedBy?.name ? ` by ${row.repliedBy.name}` : ''}
                        {row.repliedAt ? ` · ${formatDate(row.repliedAt)}` : ''}
                      </span>
                      <p>{row.reply}</p>
                    </div>
                  )}

                  {row.status !== 'closed' && (
                    <div className="adm-thread-reply">
                      <textarea
                        rows={3}
                        value={drafts[row._id] ?? ''}
                        placeholder={row.reply ? 'Add a follow-up…' : 'Write the answer…'}
                        onChange={(e) => setDrafts((d) => ({ ...d, [row._id]: e.target.value }))}
                      />
                      <div className="adm-thread-actions">
                        <button type="button" className="adm-btn" onClick={() => close(row)} disabled={busyId === row._id}>
                          Close without replying
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
              ))}
            </ul>
            <Pagination page={pager.page} pages={pager.pages} onChange={pager.setPage} />
          </>
        )}
      </Card>
    </>
  );
}
