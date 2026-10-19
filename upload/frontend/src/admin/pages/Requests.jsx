// Blood request moderation: see every request, change its status, remove spam.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import StatusTag from '../../components/StatusTag';
import ContactActions from '../../components/ContactActions';
import { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, BloodTag, StatCard, formatDate } from '../components/ui';
import { IconTrash, IconCheck, IconDrop, IconRefresh, IconClose } from '../components/Icons';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Requests() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/requests');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load requests.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

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

  const dmy = (v) => (v ? formatDate(v) : '');

  return (
    <>
      <PageHeader title="Blood requests" subtitle="Every request posted by members, with the date it was raised and the date it closed.">
        <button type="button" className="adm-btn ghost" onClick={load}><IconRefresh width={16} height={16} /> Refresh</button>
      </PageHeader>

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconDrop />} label="Open" value={pending} tone={pending ? 'warn' : 'default'} />
        <StatCard icon={<IconCheck />} label="Fulfilled" value={fulfilled} tone="accent" />
        <StatCard icon={<IconClose />} label="Cancelled" value={cancelled} />
      </div>

      <Card className="has-table">
        <DataTable
          caption="requests"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(r) => r._id}
          exportName="blood-requests"
          initialSort={{ key: 'createdAt', dir: 'desc' }}
          defaultPerPage={12}
          searchKeys={['location', 'hospital', 'bloodGroupNeeded',
                       (r) => r.requesterId?.name, (r) => r.requesterId?.phone]}
          searchPlaceholder="Search by place, hospital, member or number…"
          rowClass={(r) => (busyId === r._id ? 'busy' : '')}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'pending', label: 'Open' },
                { value: 'fulfilled', label: 'Fulfilled' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
            { key: 'bloodGroupNeeded', label: 'Blood group', options: GROUPS },
            { key: 'location', label: 'Town', options: [...new Set(items.map((r) => r.location).filter(Boolean))].sort() },
            {
              key: 'urgency',
              label: 'Urgency',
              options: [
                { value: 'critical', label: 'Critical' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'routine', label: 'Planned' },
              ],
            },
          ]}
          empty={{ title: 'No requests match', message: 'Nothing to moderate with these filters.' }}
          columns={[
            {
              key: 'bloodGroupNeeded',
              header: 'Needed',
              width: '106px',
              render: (r) => (
                <div className="req-need">
                  <BloodTag group={r.bloodGroupNeeded} />
                  <small>{r.unitsNeeded || 1} {(r.unitsNeeded || 1) === 1 ? 'unit' : 'units'}</small>
                </div>
              ),
              csv: (r) => `${r.bloodGroupNeeded} x${r.unitsNeeded || 1}`,
            },
            {
              key: 'location',
              header: 'Where',
              render: (r) => (
                <>
                  <strong>{r.location}</strong>
                  {r.hospital && <><br /><small className="adm-muted">{r.hospital}</small></>}
                </>
              ),
              csv: (r) => [r.location, r.hospital].filter(Boolean).join(' - '),
            },
            {
              key: 'requesterId.name',
              header: 'Requested by',
              render: (r) => (r.requesterId ? (
                <div className="req-who">
                  <span>{r.requesterId.name}</span>
                  <ContactActions size="sm" phone={r.requesterId.phone} name={r.requesterId.name} />
                </div>
              ) : <span className="adm-muted">Deleted member</span>),
              csv: (r) => `${r.requesterId?.name || ''} ${r.requesterId?.phone || ''}`.trim(),
            },
            {
              key: 'createdAt',
              header: 'Requested',
              width: '130px',
              render: (r) => <span className="adm-muted">{dmy(r.createdAt)}</span>,
              sortValue: (r) => new Date(r.createdAt).getTime(),
              csv: (r) => dmy(r.createdAt),
            },
            {
              key: 'closedAt',
              header: 'Closed',
              width: '130px',
              render: (r) => {
                const when = r.fulfilledAt || r.cancelledAt;
                return when
                  ? <span className="adm-muted">{dmy(when)}</span>
                  : <span className="adm-muted">—</span>;
              },
              sortValue: (r) => {
                const when = r.fulfilledAt || r.cancelledAt;
                return when ? new Date(when).getTime() : null;
              },
              csv: (r) => dmy(r.fulfilledAt || r.cancelledAt),
            },
            {
              key: 'status',
              header: 'Status',
              width: '120px',
              render: (r) => <StatusTag status={r.status} label={r.status === 'pending' ? 'Open' : undefined} />,
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '230px',
              render: (r) => (
                <div className="adm-row-actions">
                  {r.status !== 'fulfilled' && (
                    <button type="button" className="adm-btn small" onClick={() => setStatus(r, 'fulfilled')} disabled={busyId === r._id}>Fulfilled</button>
                  )}
                  {r.status !== 'pending' && (
                    <button type="button" className="adm-btn small ghost" onClick={() => setStatus(r, 'pending')} disabled={busyId === r._id}>Reopen</button>
                  )}
                  {r.status === 'pending' && (
                    <button type="button" className="adm-btn small ghost" onClick={() => setStatus(r, 'cancelled')} disabled={busyId === r._id}>Cancel</button>
                  )}
                  <button type="button" className="adm-icon-btn danger" title="Delete this request" onClick={() => setConfirm(r)}>
                    <IconTrash width={17} height={17} />
                  </button>
                </div>
              ),
            },
          ]}
        />
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
