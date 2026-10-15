// Appointment desk: confirm, cancel or remove any booking across the network.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import { usePagination } from '../../components/Pagination';
import { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Pagination, PageHeader, Card, Toolbar, SearchInput, Badge, Spinner, EmptyState, TableWrap, StatCard } from '../components/ui';
import { IconTrash, IconCalendar, IconCheck, IconClose, IconRefresh } from '../components/Icons';

export default function Appointments() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/appointments', { params: { status } });
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load appointments.');
    } finally {
      setLoading(false);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (a, next) => {
    setBusyId(a._id);
    try {
      await adminApi.put(`/admin/appointments/${a._id}`, { status: next });
      toast.success(`Appointment ${next}.`);
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
      await adminApi.delete(`/admin/appointments/${confirm._id}`);
      toast.success('Appointment deleted.');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? items.filter((a) =>
      (a.userId?.name || '').toLowerCase().includes(q) ||
      (a.doctorId?.name || '').toLowerCase().includes(q))
    : items;

  const count = (s) => items.filter((a) => a.status === s).length;

  // Admin tables page at 12 rows so the console stays scannable.
  const pager = usePagination(filtered, 12);

  return (
    <>
      <PageHeader title="Appointments" subtitle="Doctor bookings made by members.">
        <button type="button" className="adm-btn ghost" onClick={load}><IconRefresh width={16} height={16} /> Refresh</button>
      </PageHeader>

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconCalendar />} label="Awaiting confirmation" value={count('pending')} tone={count('pending') ? 'warn' : 'default'} />
        <StatCard icon={<IconCheck />} label="Confirmed" value={count('confirmed')} tone="accent" />
        <StatCard icon={<IconClose />} label="Cancelled" value={count('cancelled')} />
      </div>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by member or doctor…" />
          <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Toolbar>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState title="No appointments" message="Nothing booked with these filters." />
        ) : (
          <>
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Member</th><th>Doctor</th><th>Hospital</th><th>Date</th><th>Time</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {pager.slice.map((a) => (
                  <tr key={a._id} className={busyId === a._id ? 'busy' : ''}>
                    <td>
                      <strong>{a.userId?.name || 'Deleted member'}</strong>
                      <small className="adm-block adm-muted">{a.userId?.phone || a.userId?.email || ''}</small>
                    </td>
                    <td>{a.doctorId?.name || '—'}<small className="adm-block adm-muted">{a.doctorId?.specialization || ''}</small></td>
                    <td className="adm-muted">{a.doctorId?.hospitalId?.name || '—'}</td>
                    <td>{a.appointmentDate}</td>
                    <td>{a.appointmentTime}</td>
                    <td>
                      <Badge tone={a.status === 'confirmed' ? 'good' : a.status === 'cancelled' ? 'neutral' : 'warn'}>{a.status}</Badge>
                    </td>
                    <td className="adm-row-actions">
                      {a.status !== 'confirmed' && (
                        <button type="button" className="adm-btn small" onClick={() => changeStatus(a, 'confirmed')} disabled={busyId === a._id}>Confirm</button>
                      )}
                      {a.status !== 'cancelled' && (
                        <button type="button" className="adm-btn small ghost" onClick={() => changeStatus(a, 'cancelled')} disabled={busyId === a._id}>Cancel</button>
                      )}
                      <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(a)}><IconTrash width={17} height={17} /></button>
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
        title="Delete this appointment?"
        message="The booking will be removed and the slot freed up."
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
