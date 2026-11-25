// ONE GUIDE.
//
// It was the title, a meta line and every paragraph of the body rendered
// identically at the full width of the page — the same flat wall the blog
// article page used to be.
//
// It is now built from the same pieces the blog uses, so a guide and an
// article read the same way: the section headings down the left with the one
// you are reading marked, and the prose set at a readable measure with real
// headings, lists and highlighted points.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import PageLoader from '../components/PageLoader';
import { ArticleBody, ArticleIndex } from '../components/ArticleBody';
import { parseArticle, outlineOf } from '../lib/richtext';

const CATEGORY = {
  education: 'Donor education',
  eligibility: 'Donor eligibility',
  preparation: 'Donor preparation',
  recovery: 'Donor recovery',
  regular: 'Regular donor',
};

export default function GuideDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    window.scrollTo({ top: 0 });
    api.get(`/guides/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('That guide is not in the library.'));
  }, [id]);

  const blocks = useMemo(() => parseArticle(data?.guide?.body), [data]);
  const outline = useMemo(() => outlineOf(blocks), [blocks]);

  if (error) {
    return (
      <div className="page">
        <p className="error-text">{error}</p>
        <Link to="/guides" className="tile-link">← Guide library</Link>
      </div>
    );
  }
  if (!data) return <PageLoader label="Loading the guide" />;

  const { guide, next } = data;

  return (
    <div className="page blog-post">
      <Link to="/guides" className="blog-back">← Guide library</Link>

      <header className="article-head">
        <p className="app-eyebrow">{CATEGORY[guide.category] || 'Guide'}</p>
        <h1 className="article-title">{guide.title}</h1>
        {guide.summary && <p className="article-deck">{guide.summary}</p>}
        <p className="article-byline plain">
          <small>{guide.readMinutes} min read</small>
        </p>
      </header>

      <div className="article-layout">
        <ArticleIndex outline={outline} label="In this guide" />

        <ArticleBody blocks={blocks}>
          {next && (
            <Link className="guide-next" to={`/guides/${next._id}`}>
              <span>Next in this series</span>
              <strong>{next.title}</strong>
              <small>{next.summary}</small>
            </Link>
          )}

          <p className="portal-note">
            These guides are general information, not medical advice. The doctor
            at your blood centre confirms your eligibility on the day of donation.
          </p>
        </ArticleBody>
      </div>
    </div>
  );
}
