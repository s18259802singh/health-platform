// Donation records. These are the entries that put a member on the public
// leaderboard and generate their certificate, so only an administrator can
// create one - a member cannot claim a donation for themselves.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import {
  PageHeader, Card, Toolbar, SearchInput, Spinner, EmptyState,
  TableWrap, StatCard, formatDate,
} from '../components/ui';
import { IconPlus, IconTrash, IconDrop, IconUsers, IconCheck } from '../components/Icons';

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { userId: '', donatedAt: today(), units: 1, hospitalId: '', campId: '', locationName: '', notes: '' };

export default function Donations() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pickers for the create form
  const [members, setMembers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [camps, setCamps] = useState([]);
  const [memberQuery, setMemberQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/donations', { params: { search } });
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load donations.');
    } finally {
      setLoading(false);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openNew = async () => {
    setForm(EMPTY);
    setAdding(true);
    try {
      const [h, c] = await Promise.all([
        adminApi.get('/hospitals'),
        adminApi.get('/admin/camps', { params: { status: 'upcoming' } }),
      ]);
      setHospitals(h.data);
      setCamps(c.data);
    } catch { /* pickers are optional */ }
  };

  // Member search inside the modal - the list can be large.
  useEffect(() => {
    if (!adding) return undefined;
    const t = setTimeout(() => {
      adminApi.get('/admin/users', { params: { search: memberQuery, limit: 20 } })
        .then((res) => setMembers(res.data.items || []))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [adding, memberQuery]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.userId) return toast.error('Choose the member who donated.');
    setSaving(true);
    try {
      await adminApi.post('/admin/donations', form);
      toast.success('Donation recorded. The certificate is now available to the member.');
      setAdding(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record the donation.');
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/donations/${confirm._id}`);
      toast.success('Record removed.');
      setConfirm(null);
      load();
    } catch {
      toast.error('Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const units = items.reduce((a, d) => a + (d.units || 0), 0);
  const donors = new Set(items.map((d) => String(d.userId?._id || d.userId))).size;

  return (
    <>
      <PageHeader title="Donation records" subtitle="Confirmed donations. These drive the leaderboard and member certificates.">
        <button type="button" className="adm-btn primary" onClick={openNew}>
          <IconPlus width={16} height={16} /> Record donation
        </button>
      </PageHeader>

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconDrop />} label="Donations shown" value={items.length} tone="accent" />
        <StatCard icon={<IconCheck />} label="Units" value={units} />
        <StatCard icon={<IconUsers />} label="Distinct donors" value={donors} />
      </div>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by donor name…" />
        </Toolbar>

        {loading ? <Spinner /> : items.length === 0 ? (
          <EmptyState title="No donations recorded" message="Record a donation to put a member on the leaderboard." />
        ) : (
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Donor</th><th>Date</th><th>Group</th><th>Units</th><th>Where</th><th>Certificate</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <strong>{d.userId?.name || 'Deleted member'}</strong>
                      <small className="adm-block adm-muted">{d.userId?.email || ''}</small>
                    </td>
                    <td>{formatDate(d.donatedAt)}</td>
                    <td><span className="adm-blood">{d.bloodGroup}</span></td>
                    <td>{d.units}</td>
                    <td className="adm-muted">{d.locationName || d.hospitalId?.name || d.campId?.title || '—'}</td>
                    <td className="adm-mono">{d.certificateNo || '—'}</td>
                    <td className="adm-row-actions">
                      <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(d)}><IconTrash width={17} height={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Modal
        open={adding}
        title="Record a donation"
        subtitle="This counts towards the member's tier and issues their certificate."
        onClose={() => setAdding(false)}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button type="submit" form="donation-form" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Record donation'}</button>
          </>
        )}
      >
        <form id="donation-form" className="adm-form grid-2" onSubmit={save}>
          <label className="adm-field span-2"><span>Find the member</span>
            <input value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} placeholder="Type a name or email…" />
          </label>
          <label className="adm-field span-2"><span>Member</span>
            <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">Select a member…</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name} — {m.bloodGroup} — {m.email}</option>
              ))}
            </select>
          </label>
          <label className="adm-field"><span>Date of donation</span>
            <input type="date" required max={today()} value={form.donatedAt} onChange={(e) => setForm({ ...form, donatedAt: e.target.value })} />
          </label>
          <label className="adm-field"><span>Units</span>
            <input type="number" min="1" max="4" value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} />
          </label>
          <label className="adm-field"><span>Blood centre</span>
            <select value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value, campId: '' })}>
              <option value="">Not at a listed centre</option>
              {hospitals.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>…or at a camp</span>
            <select value={form.campId} onChange={(e) => setForm({ ...form, campId: e.target.value, hospitalId: '' })}>
              <option value="">Not at a camp</option>
              {camps.map((c) => <option key={c._id} value={c._id}>{c.title} — {c.city}</option>)}
            </select>
          </label>
          <label className="adm-field span-2"><span>Or type the location</span>
            <input value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} placeholder="Used if neither picker above applies" />
          </label>
          <label className="adm-field span-2"><span>Notes (internal)</span>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this donation record?"
        message="The member will lose this donation from their total, their tier may drop, and the certificate stops working."
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
