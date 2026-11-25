// THE GUIDE LIBRARY.
//
// Same change as the blog index: the titles and their one-line subtitles are
// what a reader uses, so they are what the page shows. The five categories
// stay, because the guides are a sequence — "can I donate" through to
// "becoming a regular" — and losing the grouping would lose the order.
//
// It was five coloured tiles in a bento grid, each with its own heading,
// blurb, count and a list inside it. The tiles were doing the work of
// section headings while looking like cards, which made a short library
// read as a busier page than it is.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PieceRow from '../components/PieceRow';
import { guideArt } from '../lib/guideArt';

const META = {
  education: { title: 'Donor education', blurb: 'How blood donation works, and why it has to be continuous.' },
  eligibility: { title: 'Donor eligibility', blurb: 'Whether you can donate, and the reasons you might be asked to wait.' },
  preparation: { title: 'Donor preparation', blurb: 'The day before, and what the appointment is actually like.' },
  recovery: { title: 'Donor recovery', blurb: 'The rest of your day, and rebuilding your iron afterwards.' },
  regular: { title: 'Regular donor', blurb: 'Building a rhythm, and answering urgent requests safely.' },
};

export default function Guides() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/guides')
      .then((res) => setData(res.data))
      .catch(() => setData({ categories: [], total: 0 }));
  }, []);

  const groups = useMemo(() => {
    const cats = (data?.categories || []).filter((c) => c.items.length > 0);
    const q = query.trim().toLowerCase();
    if (!q) return cats;
    return cats
      .map((c) => ({
        ...c,
        items: c.items.filter((g) => `${g.title} ${g.summary}`.toLowerCase().includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [data, query]);

  const found = groups.reduce((a, c) => a + c.items.length, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Guides</p>
          <h1 className="page-h1">Everything a donor needs to know</h1>
          <p>
            {data ? `${data.total} short guides, ` : ''}written plainly. Criteria
            shown are the national standard — the doctor at your centre confirms
            eligibility on the day.
          </p>
        </div>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search the guides…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search guides"
        />
      </div>

      {!data && (
        <ul className="piece-list" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="is-skeleton">
              <span className="sk sk-thumb" />
              <span className="piece-text">
                <span className="sk sk-line w-60" />
                <span className="sk sk-line w-40" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {groups.map((c) => (
        <section className="piece-group" key={c.category}>
          <div className="piece-group-head">
            <h2>{META[c.category]?.title || c.category}</h2>
            <p>{META[c.category]?.blurb}</p>
          </div>
          <ul className="piece-list">
            {c.items.map((g, i) => (
              <PieceRow
                key={g._id}
                to={`/guides/${g._id}`}
                title={g.title}
                subtitle={g.summary}
                // Drawn per category rather than photographed - see
                // lib/guideArt.js for why.
                imageUrl={guideArt(c.category, i)}
                meta={<i>{g.readMinutes} min read</i>}
              />
            ))}
          </ul>
        </section>
      ))}

      {data && found === 0 && (
        <p className="hint">
          {query ? 'No guide covers that. Try a shorter search.' : 'No guides published yet.'}
        </p>
      )}
    </div>
  );
}
