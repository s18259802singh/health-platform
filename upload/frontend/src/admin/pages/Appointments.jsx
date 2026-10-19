// Appointment desk: confirm, cancel or remove any booking across the network.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import StatusTag from '../../components/StatusTag';
import ContactActions from '../../components/ContactActions';
import { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, StatCard, formatDate } from '../components/ui';
import { IconTrash, IconCalendar, IconCheck, IconClose, IconRefresh } from '../components/Icons';

export default function Appointments() {
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
      const { data } = await adminApi.get('/admin/appointments');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load appointments.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const count = (s) => items.filter((a) => a.status === s).length;

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

      <Card className="has-table">
        <DataTable
          caption="appointments"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(a) => a._id}
          exportName="appointments"
          initialSort={{ key: 'appointmentDate', dir: 'desc' }}
          defaultPerPage={12}
          searchKeys={['userId.name', 'userId.phone', 'userId.email',
                       'doctorId.name', 'doctorId.specialization', 'doctorId.hospitalId.name']}
          searchPlaceholder="Search by member, doctor or hospital…"
          rowClass={(a) => (busyId === a._id ? 'busy' : '')}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
            { key: 'doctorId.name', label: 'Doctor', options: [...new Set(items.map((a) => a.doctorId?.name).filter(Boolean))].sort() },
            { key: 'doctorId.hospitalId.name', label: 'Hospital', options: [...new Set(items.map((a) => a.doctorId?.hospitalId?.name).filter(Boolean))].sort() },
          ]}
          empty={{ title: 'No appointments', message: 'Nothing booked with these filters.' }}
          columns={[
            {
              key: 'userId.name',
              header: 'Member',
              render: (a) => (a.userId ? (
                <div className="req-who">
                  <span>{a.userId.name}</span>
                  <ContactActions size="sm" phone={a.userId.phone} email={a.userId.email} name={a.userId.name} />
                </div>
              ) : <span className="adm-muted">Deleted member</span>),
              csv: (a) => `${a.userId?.name || ''} ${a.userId?.phone || a.userId?.email || ''}`.trim(),
            },
            {
              key: 'doctorId.name',
              header: 'Doctor',
              render: (a) => (
                <>
                  <strong>{a.doctorId?.name || '—'}</strong>
                  {a.doctorId?.specialization && <><br /><small className="adm-muted">{a.doctorId.specialization}</small></>}
                </>
              ),
              csv: (a) => [a.doctorId?.name, a.doctorId?.specialization].filter(Boolean).join(' - '),
            },
            {
              key: 'doctorId.hospitalId.name',
              header: 'Hospital',
              render: (a) => <span className="adm-muted">{a.doctorId?.hospitalId?.name || '—'}</span>,
            },
            {
              key: 'appointmentDate',
              header: 'Date',
              width: '130px',
              render: (a) => formatDate(a.appointmentDate),
              csv: (a) => formatDate(a.appointmentDate),
            },
            { key: 'appointmentTime', header: 'Time', width: '110px' },
            {
              key: 'status',
              header: 'Status',
              width: '120px',
              render: (a) => <StatusTag status={a.status} />,
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '190px',
              render: (a) => (
                <div className="adm-row-actions">
                  {a.status !== 'confirmed' && (
                    <button type="button" className="adm-btn small" onClick={() => changeStatus(a, 'confirmed')} disabled={busyId === a._id}>Confirm</button>
                  )}
                  {a.status !== 'cancelled' && (
                    <button type="button" className="adm-btn small ghost" onClick={() => changeStatus(a, 'cancelled')} disabled={busyId === a._id}>Cancel</button>
                  )}
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(a)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
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
