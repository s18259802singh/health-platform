// The donor guide hub - five categories covering the journey from "can I
// donate?" through to becoming a regular donor.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const META = {
  education: { title: 'Donor education', blurb: 'How blood donation works, and why it has to be continuous.' },
  eligibility: { title: 'Donor eligibility', blurb: 'Whether you can donate, and the reasons you might be asked to wait.' },
  preparation: { title: 'Donor preparation', blurb: 'The day before, and what the appointment is actually like.' },
  recovery: { title: 'Donor recovery', blurb: 'The rest of your day, and rebuilding your iron afterwards.' },
  regular: { title: 'Regular donor', blurb: 'Building a rhythm, and answering urgent requests safely.' },
};

export default function Guides() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/guides').then((res) => setData(res.data)).catch(() => setData({ categories: [], total: 0 }));
  }, []);

  if (!data) return <p className="hint">Loading the guide library…</p>;

  return (
    <div className="page">
      <p className="app-eyebrow">Guides</p>
      <h2 className="page-title">Everything a donor needs to know</h2>
      <p className="app-subtext">
        {data.total} short guides, written plainly. Criteria shown are the national
        standard — the doctor at your centre confirms eligibility on the day.
      </p>

      <div className="guide-cat-grid">
        {data.categories.filter((c) => c.items.length > 0).map((c) => (
          <section className="guide-cat" key={c.category}>
            <header>
              <h3>{META[c.category]?.title || c.category}</h3>
              <span className="guide-count">{c.items.length} guide{c.items.length === 1 ? '' : 's'}</span>
            </header>
            <p className="guide-blurb">{META[c.category]?.blurb}</p>
            <ul className="guide-links">
              {c.items.map((g) => (
                <li key={g._id}>
                  <Link to={`/guides/${g._id}`}>
                    <strong>{g.title}</strong>
                    <small>{g.summary}</small>
                    <em>{g.readMinutes} min read</em>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
