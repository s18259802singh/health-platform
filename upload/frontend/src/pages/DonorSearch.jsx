// Live donor search - this is the "AJAX" module from the roadmap, done in React.
// Every time the blood group or location changes, we call the API again and
// React re-renders the list automatically. No manual DOM updates, no page reload.

import { useEffect, useState } from 'react';
import api from '../api/axios';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Who can RECEIVE from whom - standard ABO/Rh compatibility.
const CAN_RECEIVE_FROM = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};
const canDonateTo = (g) =>
  Object.keys(CAN_RECEIVE_FROM).filter((r) => CAN_RECEIVE_FROM[r].includes(g));

export default function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myGroup, setMyGroup] = useState(''); // compatibility checker selection
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');

  // ---- VOICE SEARCH ----
  // Uses the browser's built-in speech recognition (Chrome/Edge).
  // Say e.g. "O positive donors in Surat" - we pull out the blood group
  // and the city and run the normal search with them.
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  const parseSpeech = (text) => {
    const t = ' ' + text.toLowerCase().replace(/[.,]/g, '') + ' ';
    let group = '';
    const abo = t.match(/\b(ab|a|b|o)\s*(positive|negative|plus|minus|\+|-)/);
    if (abo) {
      const sign = ['positive', 'plus', '+'].includes(abo[2]) ? '+' : '-';
      group = abo[1].toUpperCase() + sign;
    }
    let city = '';
    const inMatch = t.match(/\b(?:in|from|at|near)\s+([a-z]+)/);
    if (inMatch) city = inMatch[1];
    return { group, city };
  };

  const startVoice = () => {
    if (!SpeechRec) { setHeard('Voice search needs Chrome or Edge.'); return; }
    const rec = new SpeechRec();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    setListening(true);
    setHeard('');
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setHeard(`"${text}"`);
      const { group, city } = parseSpeech(text);
      if (group) setBloodGroup(group);
      if (city) setLocation(city);
      if (!group && !city) setHeard(`"${text}" - try saying a blood group like "B positive in Surat"`);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); setHeard('Could not hear you - try again.'); };
    rec.start();
  };

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (bloodGroup) params.bloodGroup = bloodGroup;
    if (location) params.location = location;

    // small debounce so we don't fire an API call on every single keystroke
    const timer = setTimeout(() => {
      api.get('/donors', { params })
        .then((res) => setDonors(res.data))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [bloodGroup, location]);

  return (
    <div className="page">
      <h2>Find Blood Donors</h2>
      <div className="search-bar">
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
          {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg || 'Any Blood Group'}</option>)}
        </select>
        <input
          placeholder="Search by city / location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button
          type="button"
          className={`mic-button ${listening ? 'listening' : ''}`}
          onClick={startVoice}
          title='Voice search - say e.g. "O positive donors in Surat"'
        >
          {listening ? 'Listening...' : 'Speak'}
        </button>
      </div>
      {heard && <p className="voice-heard">{heard}</p>}

      {/* ---- BLOOD COMPATIBILITY CHECKER ---- */}
      <div className="compat-card">
        <h3>Blood Compatibility Checker</h3>
        <p className="compat-hint">Tap a blood group to see who it can give to and receive from.</p>
        <div className="compat-groups">
          {BLOOD_GROUPS.slice(1).map((bg) => (
            <button
              key={bg}
              type="button"
              className={`compat-chip ${myGroup === bg ? 'selected' : ''}`}
              onClick={() => setMyGroup(myGroup === bg ? '' : bg)}
            >
              {bg}
            </button>
          ))}
        </div>
        {myGroup && (
          <div className="compat-results">
            <div>
              <span className="compat-label">{myGroup} can donate to</span>
              <div className="compat-badges">
                {canDonateTo(myGroup).map((bg) => <span key={bg} className="blood-badge">{bg}</span>)}
              </div>
            </div>
            <div>
              <span className="compat-label">{myGroup} can receive from</span>
              <div className="compat-badges">
                {CAN_RECEIVE_FROM[myGroup].map((bg) => <span key={bg} className="blood-badge alt">{bg}</span>)}
              </div>
            </div>
            <button
              type="button"
              className="small-button"
              onClick={() => setBloodGroup(myGroup)}
            >
              Show {myGroup} donors above
            </button>
          </div>
        )}
      </div>

      {loading && <p>Searching...</p>}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Blood Group</th><th>Phone</th><th>Location</th></tr>
        </thead>
        <tbody>
          {donors.map((d) => (
            <tr key={d._id}>
              <td>{d.name}</td>
              <td><span className="blood-badge">{d.bloodGroup}</span></td>
              <td>{d.phone}</td>
              <td>{d.location}</td>
            </tr>
          ))}
          {!loading && donors.length === 0 && (
            <tr><td colSpan={4}>No donors found matching your search.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
