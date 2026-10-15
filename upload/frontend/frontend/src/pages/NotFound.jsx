import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page empty-page">
      <p className="app-eyebrow">404</p>
      <h2 className="app-heading">That page doesn’t exist</h2>
      <p className="app-subtext">The link may be out of date, or the page has moved.</p>
      <Link to="/" className="banner-button">Back to home</Link>
    </div>
  );
}
