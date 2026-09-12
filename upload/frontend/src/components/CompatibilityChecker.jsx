// COMPATIBILITY CHECKER - new
// A small, self-contained widget that answers the question every donor
// search eventually runs into: "wait, can I actually give to them?".
// Tap a blood group and it shows who that group can donate to and receive
// from (standard ABO/Rh rules), then offers to filter the live donor list
// in DonorSearch.jsx to only the groups compatible with the one picked -
// so it is not just a reference chart, it drives the real search above it.

import { useState } from 'react';

const GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// Single source of truth: who each group can donate TO.
// "Can receive from" for any group is just the reverse of this map.
const CAN_DONATE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // universal recipient
};

function canReceiveFrom(group) {
  return GROUPS.filter((donor) => CAN_DONATE_TO[donor].includes(group));
}

export default function CompatibilityChecker({ onFilterDonors }) {
  const [selected, setSelected] = useState(null);

  const donateTo = selected ? CAN_DONATE_TO[selected] : [];
  const receiveFrom = selected ? canReceiveFrom(selected) : [];

  return (
    <div className="compat-card">
      <div className="compat-head">
        <h3>Compatibility Checker <span className="compat-new">New</span></h3>
        <p>Tap your blood group to see who you can safely give to and receive from.</p>
      </div>

      <div className="compat-grid" role="group" aria-label="Select a blood group">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            className={`compat-tile ${selected === g ? 'active' : ''}`}
            onClick={() => setSelected(g === selected ? null : g)}
          >
            {g}
          </button>
        ))}
      </div>

      {selected && (
        <div className="compat-result">
          <div className="compat-col">
            <span className="compat-label">Can donate to</span>
            <div className="compat-pills">
              {donateTo.map((g) => <span key={g} className="compat-pill">{g}</span>)}
            </div>
          </div>
          <div className="compat-col">
            <span className="compat-label">Can receive from</span>
            <div className="compat-pills">
              {receiveFrom.map((g) => <span key={g} className="compat-pill alt">{g}</span>)}
            </div>
          </div>
          {onFilterDonors && (
            <button
              type="button"
              className="small-button compat-apply"
              onClick={() => onFilterDonors(selected, receiveFrom)}
            >
              Show donors who can give to {selected} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
