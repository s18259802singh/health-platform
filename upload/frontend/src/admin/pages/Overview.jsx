// Admin dashboard - the real operational picture, all from one API call.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { Card, StatCard, PageHeader, Spinner, Badge, BloodTag, TableWrap, formatDate } from '../components/ui';
import { BarChart, TrendChart, RankList } from '../components/Charts';
import { IconUsers, IconDrop, IconHospital, IconCalendar, IconStethoscope, IconArticle, IconRefresh } from '../components/Icons';

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await adminApi.get('/admin/overview');
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the dashboard.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <p className="adm-form-error">{error}</p>;
  if (!data) return <Spinner label="Loading dashboard…" />;

  const { counts, bloodGroups, signupTrend, topCities, recentUsers, recentRequests } = data;
  const shortages = bloodGroups.filter((g) => g.pendingRequests > g.donors);
  const newThisFortnight = signupTrend.reduce((a, b) => a + b.count, 0);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live picture of the LifeLink network.">
        <button type="button" className="adm-btn ghost" onClick={load} disabled={refreshing}>
          <IconRefresh width={16} height={16} /> {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </PageHeader>

      <div className="adm-stat-grid">
        <StatCard icon={<IconUsers />} label="Registered members" value={counts.totalUsers}
          hint={`${newThisFortnight} new in 14 days`} />
        <StatCard icon={<IconDrop />} label="Willing donors" value={counts.totalDonors} tone="accent"
          hint={`${Math.round((counts.totalDonors / Math.max(1, counts.totalUsers)) * 100)}% of members`} />
        <StatCard icon={<IconDrop />} label="Open blood requests" value={counts.pendingRequests}
          tone={counts.pendingRequests > 0 ? 'warn' : 'default'}
          hint={`${counts.fulfilledRequests} fulfilled to date`} />
        <StatCard icon={<IconCalendar />} label="Appointments" value={counts.totalAppointments}
          hint={`${counts.pendingAppointments} awaiting confirmation`} />
        <StatCard icon={<IconHospital />} label="Hospitals & banks" value={counts.totalHospitals + counts.totalBloodBanks}
          hint={`${counts.totalHospitals} hospitals · ${counts.totalBloodBanks} blood banks`} />
        <StatCard icon={<IconStethoscope />} label="Doctors listed" value={counts.totalDoctors} />
        <StatCard icon={<IconArticle />} label="Published articles" value={counts.totalBlogs} />
        <StatCard icon={<IconUsers />} label="Administrators" value={counts.totalAdmins} />
      </div>

      {shortages.length > 0 && (
        <div className="adm-alert">
          <strong>Shortage alert</strong>
          <span>
            Open requests outnumber registered donors for {shortages.map((s) => s.group).join(', ')}.
          </span>
          <Link to="/admin/requests" className="adm-btn small">Review requests</Link>
        </div>
      )}

      <div className="adm-grid-2">
        <Card title="Donors vs open requests, by blood group">
          <BarChart
            data={bloodGroups.map((g) => ({ label: g.group, primary: g.donors, secondary: g.pendingRequests }))}
          />
          <div className="adm-legend">
            <span><i className="dot main" /> Registered donors</span>
            <span><i className="dot need" /> Open requests</span>
          </div>
        </Card>

        <Card title="New registrations — last 14 days">
          <TrendChart points={signupTrend} />
          <p className="adm-muted">{newThisFortnight} people joined in the last fortnight.</p>
        </Card>
      </div>

      <div className="adm-grid-2">
        <Card title="Where the donors are" action={<Link to="/admin/users" className="adm-link">All members</Link>}>
          {topCities.length === 0
            ? <p className="adm-muted">No locations recorded yet.</p>
            : <RankList items={topCities.map((c) => ({ label: c.city, count: c.count }))} />}
        </Card>

        <Card title="Latest blood requests" action={<Link to="/admin/requests" className="adm-link">Manage</Link>}>
          {recentRequests.length === 0 ? <p className="adm-muted">No requests yet.</p> : (
            <TableWrap>
              <table className="adm-table compact">
                <thead><tr><th>Group</th><th>Location</th><th>Requested by</th><th>Status</th></tr></thead>
                <tbody>
                  {recentRequests.map((r) => (
                    <tr key={r._id}>
                      <td><BloodTag group={r.bloodGroupNeeded} /></td>
                      <td>{r.location}</td>
                      <td>{r.requesterId?.name || 'Deleted member'}</td>
                      <td><Badge tone={r.status === 'pending' ? 'warn' : r.status === 'fulfilled' ? 'good' : 'neutral'}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      </div>

      <Card title="Newest members" action={<Link to="/admin/users" className="adm-link">Manage members</Link>}>
        <TableWrap>
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Group</th><th>Donor</th><th>Location</th><th>Joined</th></tr></thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u._id}>
                  <td className="adm-strong">{u.name}</td>
                  <td className="adm-muted">{u.email}</td>
                  <td><BloodTag group={u.bloodGroup} /></td>
                  <td>{u.isDonor ? <Badge tone="good">Donor</Badge> : <Badge>—</Badge>}</td>
                  <td>{u.location || '—'}</td>
                  <td className="adm-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}
