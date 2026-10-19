// Hospitals & blood banks: full CRUD including per-group stock levels.

import { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import ContactActions from '../../components/ContactActions';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Badge } from '../components/ui';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const blankUnits = () => GROUPS.map((g) => ({ bloodGroup: g, units: 0 }));
const EMPTY = { name: '', address: '', contactNumber: '', type: 'hospital', availableBloodUnits: blankUnits() };

const totalUnits = (h) => (h.availableBloodUnits || []).reduce((a, u) => a + (u.units || 0), 0);

// The eight stock boxes share one label, so one message that names the group
// at fault is more use than eight identical errors stacked under the grid.
const stockRule = (list) => {
  const bad = (list || []).find((u) => {
    const n = Number(u.units);
    return !Number.isFinite(n) || n % 1 !== 0 || n < 0 || n > 9999;
  });
  return bad ? `${bad.bloodGroup} units must be a whole number between 0 and 9999` : '';
};

// A location is an organisation, not a person, so names here allow digits and
// punctuation that rules.name would reject - "Civil Hospital (Unit 2)".
const schema = {
  name: rules.text({ label: 'Name', min: 2, max: 120 }),
  address: rules.text({ label: 'Address', min: 5, max: 200 }),
  contactNumber: rules.anyPhone,
  availableBloodUnits: stockRule,
};

export default function Hospitals() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/hospitals');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load hospitals.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isNew = editing === 'new';

  const form = useForm(EMPTY, schema, {
    onSubmit: async (values) => {
      // Zero-stock rows are dropped rather than stored, so a group with
      // nothing on the shelf reads as absent rather than as a recorded zero.
      const payload = {
        ...values,
        name: String(values.name).trim(),
        address: String(values.address).trim(),
        contactNumber: String(values.contactNumber).trim(),
        availableBloodUnits: (values.availableBloodUnits || [])
          .map((u) => ({ ...u, units: Number(u.units) || 0 }))
          .filter((u) => u.units > 0),
      };
      try {
        if (isNew) {
          await adminApi.post('/hospitals', payload);
          toast.success('Hospital added.');
        } else {
          await adminApi.put(`/hospitals/${editing._id}`, payload);
          toast.success('Hospital updated.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not save.');
        throw err; // useForm puts the server's field messages back on the fields
      }
      setEditing(null);
      load();
    },
  });

  const closeForm = () => { setEditing(null); form.reset(EMPTY); };

  const openNew = () => { form.reset({ ...EMPTY, availableBloodUnits: blankUnits() }); setEditing('new'); };

  const openEdit = (h) => {
    const units = blankUnits().map((u) => ({
      ...u,
      units: h.availableBloodUnits?.find((x) => x.bloodGroup === u.bloodGroup)?.units || 0,
    }));
    form.reset({
      name: h.name || '', address: h.address || '', contactNumber: h.contactNumber || '',
      type: h.type || 'hospital', availableBloodUnits: units,
    });
    setEditing(h);
  };

  const setUnits = (group, value) => {
    form.setField('availableBloodUnits', (form.values.availableBloodUnits || [])
      .map((u) => (u.bloodGroup === group ? { ...u, units: value } : u)));
    form.setTouched((t) => ({ ...t, availableBloodUnits: true }));
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/hospitals/${confirm._id}`);
      toast.success('Hospital removed.');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Hospitals & blood banks" subtitle={`${items.length} location${items.length === 1 ? '' : 's'} on the network.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}><IconPlus width={16} height={16} /> Add location</button>
      </PageHeader>

      <Card className="has-table">
        <DataTable
          caption="locations"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(h) => h._id}
          exportName="hospitals-and-blood-banks"
          initialSort={{ key: 'name', dir: 'asc' }}
          defaultPerPage={12}
          searchKeys={['name', 'address', 'city', 'district', 'state', 'contactNumber']}
          searchPlaceholder="Search by name, address or number…"
          filters={[
            {
              key: 'type',
              label: 'Type',
              options: [
                { value: 'hospital', label: 'Hospitals' },
                { value: 'blood_bank', label: 'Blood banks' },
              ],
            },
            { key: 'city', label: 'Town', options: [...new Set(items.map((h) => h.city).filter(Boolean))].sort() },
            {
              key: 'stock',
              label: 'Stock',
              placeholder: 'Any stock level',
              options: [
                { value: 'yes', label: 'Has units on the shelf' },
                { value: 'no', label: 'Nothing recorded' },
              ],
              match: (h, v) => (v === 'yes' ? totalUnits(h) > 0 : totalUnits(h) === 0),
            },
          ]}
          empty={{ title: 'Nothing here yet', message: 'Add a hospital or blood bank, or clear the search.' }}
          columns={[
            { key: 'name', header: 'Name', render: (h) => <strong>{h.name}</strong> },
            {
              key: 'address',
              header: 'Address',
              render: (h) => <span className="adm-muted">{h.address}</span>,
            },
            {
              key: 'contactNumber',
              header: 'Contact',
              sortable: false,
              width: '120px',
              render: (h) => <ContactActions size="sm" phone={h.contactNumber} address={h.address} name={h.name} />,
              csv: (h) => h.contactNumber || '',
            },
            {
              key: 'type',
              header: 'Type',
              width: '130px',
              render: (h) => (h.type === 'blood_bank' ? <Badge tone="accent">Blood bank</Badge> : <Badge>Hospital</Badge>),
              csv: (h) => (h.type === 'blood_bank' ? 'Blood bank' : 'Hospital'),
            },
            {
              key: 'stock',
              header: 'Stock',
              width: '110px',
              sortValue: totalUnits,
              render: (h) => (totalUnits(h) > 0 ? `${totalUnits(h)} units` : <span className="adm-muted">—</span>),
              csv: totalUnits,
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '96px',
              render: (h) => (
                <div className="adm-row-actions">
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(h)}><IconEdit width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(h)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!editing}
        title={isNew ? 'Add a hospital or blood bank' : `Edit ${editing?.name || ''}`}
        onClose={closeForm}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="hospital-form" className="adm-btn primary" disabled={form.busy}>{form.busy ? 'Saving…' : 'Save location'}</button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="hospital-form" className="adm-form grid-2" onSubmit={form.submit} ref={form.formRef} noValidate>
          <Field label="Name" htmlFor="name" required className="span-2" error={form.errorFor('name')}>
            <input id="name" {...form.field('name')} />
          </Field>

          <Field label="Address" htmlFor="address" required className="span-2"
                 error={form.errorFor('address')}
                 hint="Enough for somebody to find the door in an emergency.">
            <input id="address" autoComplete="street-address" {...form.field('address')} />
          </Field>

          <Field label="Contact number" htmlFor="contactNumber" required
                 error={form.errorFor('contactNumber')}
                 hint="A switchboard or landline is fine here.">
            <input id="contactNumber" inputMode="tel" {...form.field('contactNumber')} />
          </Field>

          <Field label="Type" htmlFor="type">
            <select id="type" {...form.field('type')}>
              <option value="hospital">Hospital</option>
              <option value="blood_bank">Blood bank</option>
            </select>
          </Field>

          <Field label="Blood units in stock" className="span-2"
                 error={form.errorFor('availableBloodUnits')}
                 hint="Leave a group at zero if nothing is on the shelf.">
            <div className="adm-units" id="availableBloodUnits">
              {(form.values.availableBloodUnits || []).map((u) => (
                <label key={u.bloodGroup} className="adm-unit">
                  <span>{u.bloodGroup}</span>
                  <input type="number" min="0" max="9999" step="1" inputMode="numeric"
                         value={u.units}
                         onChange={(e) => setUnits(u.bloodGroup, e.target.value)} />
                </label>
              ))}
            </div>
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this location?"
        message={`${confirm?.name} will be removed from the public hospital list.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
