import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <strong>LifeLink</strong>
            <p>Connecting donors, patients and hospitals when minutes matter.</p>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <div>
            <h4>Find blood</h4>
            <Link to="/availability">Blood availability</Link>
            <Link to="/donors">Find donors</Link>
            <Link to="/requests">Blood requests</Link>
            <Link to="/hospitals">Hospitals &amp; banks</Link>
          </div>
          <div>
            <h4>Donate</h4>
            <Link to="/camps">Donation camps</Link>
            <Link to="/register">Become a donor</Link>
            <Link to="/leaderboard">Donor leaderboard</Link>
            <Link to="/my-donations">My donations</Link>
          </div>
          <div>
            <h4>Learn</h4>
            <Link to="/guides">Donor guides</Link>
            <Link to="/stories">Donor stories</Link>
            <Link to="/blogs">Health blog</Link>
            <Link to="/appointments">Book a doctor</Link>
          </div>
        </nav>
      </div>

      <div className="footer-base">
        <span>© {new Date().getFullYear()} LifeLink. Built for faster emergency response.</span>
        <span className="footer-note">In a life-threatening emergency, always call your local emergency number first.</span>
      </div>
    </footer>
  );
}
