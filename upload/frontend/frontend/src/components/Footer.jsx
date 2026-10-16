import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand footer-logo"><Logo size={36} showDescriptor={false} /></Link>
          <p>
            A public register connecting blood donors, patients, hospitals and
            blood banks — so finding a compatible donor takes a search, not a
            chain of phone calls.
          </p>
          <ul className="footer-assurances">
            <li>Free for donors and recipients</li>
            <li>Contact details shown only to signed-in members</li>
            <li>Stock figures sourced from the listed centres</li>
          </ul>
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
        <span>© {new Date().getFullYear()} LifeLink</span>
        <span className="footer-note">
          Information on this site is general and not medical advice. In a
          life-threatening emergency, call your local emergency number first.
        </span>
      </div>
    </footer>
  );
}
