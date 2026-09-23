// ADMIN > USERS
// Read-only list of registered accounts (passwords are never sent by the API).

import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data));
  }, []);

  const q = search.toLowerCase();
  const shown = users.filter((u) =>
    !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.location?.toLowerCase().includes(q)
  );

  return (
    <div className="page">
      <h2>Users ({users.length})</h2>
      <input
        className="search-bar"
        placeholder="Search by name, email or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Blood Group</th><th>Donor</th><th>City</th><th>Role</th><th>Joined</th></tr>
        </thead>
        <tbody>
          {shown.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td><span className="blood-badge">{u.bloodGroup}</span></td>
              <td>{u.isDonor ? 'Yes' : 'No'}</td>
              <td>{u.location}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
