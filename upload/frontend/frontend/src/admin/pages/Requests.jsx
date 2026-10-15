// Blood request moderation: see every request, change its status, remove spam.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import { usePagination } from '../../components/Pagination';
import { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Pagination, PageHeader, Card, Toolbar, SearchInput, Badge, BloodTag, Spinner, EmptyState, TableWrap, StatCard, formatDate } from '../components/ui';
import { IconTrash, IconCheck, IconDrop, IconRefresh, IconClose } from '../components/Icons';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Requests() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', bloodGroup: '', search: '' });
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/requests', { params: filters });
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setStatus = async (req, status) => {
    setBusyId(req._id);
    try {
      await adminApi.put(`/admin/requests/${req._id}`, { status });
      toast.success(`Request marked ${status}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/requests/${confirm._id}`);
      toast.success('Request deleted.');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const pending = items.filter((r) => r.status === 'pending').length;
  const fulfilled = items.filter((r) => r.status === 'fulfilled').length;
  const cancelled = items.filter((r) => r.status === 'cancelled').length;

  // Admin tables page at 12 rows so the console stays scannable.
  const pager = usePagination(items, 12);

  return (
    <>
      <PageHeader title="Blood requests" subtitle="Every request posted by members, oldest status first.">
        <button type="button" className="adm-btn ghost" onClick={load}><IconRefresh width={16} height={16} /> Refresh</button>
      </PageHeader>

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconDrop />} label="Open" value={pending} tone={pending ? 'warn' : 'default'} />
        <StatCard icon={<IconCheck />} label="Fulfilled" value={fulfilled} tone="accent" />
        <StatCard icon={<IconClose />} label="Cancelled" value={cancelled} />
      </div>

      <Card>
        <Toolbar>
          <SearchInput value={filters.search} onChange={(v) => setFilters((f) => ({ ...f, search: v }))} placeholder="Search by location…" />
          <select className="adm-select" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="pending">Open</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="adm-select" value={filters.bloodGroup} onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}>
            <option value="">All blood groups</option>
            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Toolbar>

        {loading ? <Spinner /> : items.length === 0 ? (
          <EmptyState title="No requests match" message="Nothing to moderate with these filters." />
        ) : (
          <>
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Group</th><th>Location</th><th>Requested by</th><th>Contact</th><th>Posted</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {pager.slice.map((r) => (
                  <tr key={r._id} className={busyId === r._id ? 'busy' : ''}>
                    <td><BloodTag group={r.bloodGroupNeeded} /></td>
                    <td className="adm-strong">{r.location}</td>
                    <td>{r.requesterId?.name || <span className="adm-muted">Deleted member</span>}</td>
                    <td className="adm-muted">{r.requesterId?.phone || '—'}</td>
                    <td className="adm-muted">{formatDate(r.createdAt)}</td>
                    <td>
                      <Badge tone={r.status === 'pending' ? 'warn' : r.status === 'fulfilled' ? 'good' : 'neutral'}>
                        {r.status === 'pending' ? 'Open' : r.status}
                      </Badge>
                    </td>
                    <td className="adm-row-actions">
                      {r.status !== 'fulfilled' && (
                        <button type="button" className="adm-btn small" onClick={() => setStatus(r, 'fulfilled')} disabled={busyId === r._id}>Mark fulfilled</button>
                      )}
                      {r.status !== 'pending' && (
                        <button type="button" className="adm-btn small ghost" onClick={() => setStatus(r, 'pending')} disabled={busyId === r._id}>Reopen</button>
                      )}
                      {r.status === 'pending' && (
                        <button type="button" className="adm-btn small ghost" onClick={() => setStatus(r, 'cancelled')} disabled={busyId === r._id}>Cancel</button>
                      )}
                      <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(r)}><IconTrash width={17} height={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        <Pagination page={pager.page} pages={pager.pages} onChange={pager.setPage} />
        </>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this request?"
        message="The request will disappear from the member-facing list permanently."
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
