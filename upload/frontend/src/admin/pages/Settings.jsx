// Console settings: who is signed in, where the API points, and the
// maintenance tools that used to sit on the public user dashboard.

import { useState } from 'react';
import adminApi from '../../api/adminApi';
import { API_BASE_URL } from '../../api/axios';
import { useAdminAuth } from '../AdminAuthContext';
import { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Badge, initials } from '../components/ui';
import { IconRefresh, IconExternal } from '../components/Icons';

export default function Settings() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState('');

  const reseed = async () => {
    setSeeding(true);
    try {
      const { data } = await adminApi.post('/admin/seed');
      setResult(`Loaded ${data.donors} donors, ${data.hospitals} hospitals, ${data.doctors} doctors and ${data.blogs} articles.`);
      toast.success('Sample data reloaded.');
      setConfirmSeed(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reload failed.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings & data" subtitle="Console account, environment and maintenance tools." />

      <div className="adm-grid-2">
        <Card title="Signed in as">
          <div className="adm-profile">
            <span className="adm-avatar lg">{initials(admin?.name)}</span>
            <div>
              <strong>{admin?.name}</strong>
              <p className="adm-muted">{admin?.email}</p>
              <Badge tone="accent">Administrator</Badge>
            </div>
          </div>
          <p className="adm-muted adm-spaced">
            Admin sessions are separate from member sessions and expire after 24 hours.
            Signing out here does not sign you out of the public site.
          </p>
        </Card>

        <Card title="Environment">
          <dl className="adm-dl">
            <div><dt>API endpoint</dt><dd className="adm-mono">{API_BASE_URL}</dd></div>
            <div><dt>Console path</dt><dd className="adm-mono">/admin</dd></div>
            <div><dt>Public site</dt><dd><a className="adm-link" href="/" target="_blank" rel="noreferrer">Open <IconExternal width={13} height={13} /></a></dd></div>
          </dl>
          <p className="adm-muted adm-spaced">
            Change the endpoint with the <code>VITE_API_URL</code> environment variable at build time.
          </p>
        </Card>
      </div>

      <Card title="Demo data">
        <p>
          Reloads the sample dataset — donors, hospitals, doctors and health articles.
          Existing sample records are replaced; administrator accounts are kept.
        </p>
        {result && <p className="adm-note">{result}</p>}
        <button type="button" className="adm-btn primary adm-spaced" onClick={() => setConfirmSeed(true)} disabled={seeding}>
          <IconRefresh width={16} height={16} /> {seeding ? 'Reloading…' : 'Reload sample data'}
        </button>
      </Card>

      <ConfirmDialog
        open={confirmSeed}
        title="Reload sample data?"
        message="This replaces donors, hospitals, doctors, articles, requests and appointments with the sample dataset. Administrator accounts are kept. It cannot be undone."
        confirmLabel="Reload data"
        busy={seeding}
        onCancel={() => setConfirmSeed(false)}
        onConfirm={reseed}
      />
    </>
  );
}
