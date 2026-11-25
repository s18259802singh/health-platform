// SAMPLE blood donation camps for the demo.
// `daysFromNow` is turned into a real date by seedRunner, so the camp list is
// never stale no matter when the dataset is loaded.
module.exports = [
  { daysFromNow: 3, title: 'City Centre Mega Blood Drive', organiser: 'Indian Red Cross Society, Surat', venue: 'Surat Municipal Corporation Hall, Muglisara', city: 'Surat', state: 'Gujarat', startTime: '09:00 AM', endTime: '04:00 PM', slots: 180, contactNumber: '0261 242 3333',
    description: 'Our largest drive of the quarter, run with four partner blood centres. Walk-ins welcome, but registering ahead guarantees you a slot and cuts your waiting time to around fifteen minutes.\n\nRefreshments, a medical check and a donation certificate are provided on the day.' },
  { daysFromNow: 6, title: 'Campus Donors Day', organiser: 'Veer Narmad South Gujarat University NSS', venue: 'Main Auditorium, VNSGU Campus, Udhna Magdalla Road', city: 'Surat', state: 'Gujarat', startTime: '10:00 AM', endTime: '03:00 PM', slots: 120, contactNumber: '0261 227 7956',
    description: 'A student-led camp open to staff and the public as well. First-time donors are paired with a volunteer who walks them through the process.' },
  { daysFromNow: 9, title: 'Ahmedabad Corporate Donation Camp', organiser: 'Prathama Blood Centre', venue: 'GIFT City Club House, Gandhinagar Road', city: 'Ahmedabad', state: 'Gujarat', startTime: '09:30 AM', endTime: '05:00 PM', slots: 200, contactNumber: '079 2970 0101',
    description: 'Hosted across three office towers with a shuttle between them. Book a thirty-minute window so your team can go together.' },
  { daysFromNow: 12, title: 'Rajkot Community Blood Drive', organiser: 'Lions Club of Rajkot', venue: 'Race Course Ground Pavilion', city: 'Rajkot', state: 'Gujarat', startTime: '08:00 AM', endTime: '02:00 PM', slots: 150, contactNumber: '0281 248 1111',
    description: 'An annual drive that has collected more than 4,000 units since it started. Parking is free at the pavilion gate.' },
  { daysFromNow: 15, title: 'Vadodara Festival of Giving', organiser: 'Baroda Blood Bank Association', venue: 'Sayajigunj Community Centre', city: 'Vadodara', state: 'Gujarat', startTime: '10:00 AM', endTime: '06:00 PM', slots: 160, contactNumber: '0265 236 5000',
    description: 'Part of the city festival week. Live music, a childrens area and six donation bays running in parallel.' },
  { daysFromNow: 19, title: 'Thalassaemia Support Drive', organiser: 'Gujarat Thalassaemia Society', venue: 'Civil Hospital Annexe, Asarwa', city: 'Ahmedabad', state: 'Gujarat', startTime: '09:00 AM', endTime: '01:00 PM', slots: 90, contactNumber: '079 2268 0074',
    description: 'Units from this camp are reserved for children on regular transfusion programmes. Donors with B negative and O negative are especially needed.' },
  { daysFromNow: 23, title: 'Bhavnagar Coastal Camp', organiser: 'Rotary Club of Bhavnagar', venue: 'Rotary Bhavan, Waghawadi Road', city: 'Bhavnagar', state: 'Gujarat', startTime: '09:00 AM', endTime: '03:00 PM', slots: 110, contactNumber: '0278 242 8800',
    description: 'A smaller, calmer camp suited to first-time donors who would rather avoid a crowd.' },
  { daysFromNow: 28, title: 'Navsari District Drive', organiser: 'B.K. Shah Red Cross Bhavan', venue: 'Red Cross Bhavan, Station Road', city: 'Navsari', state: 'Gujarat', startTime: '09:30 AM', endTime: '02:30 PM', slots: 100, contactNumber: '02637 259 300',
    description: 'Covering Navsari and the surrounding talukas, with a mobile unit visiting Bilimora in the afternoon.' },
  { daysFromNow: -8, title: 'Monsoon Emergency Appeal Camp', organiser: 'Indian Red Cross Society, Surat', venue: 'Athwalines Community Hall', city: 'Surat', state: 'Gujarat', startTime: '09:00 AM', endTime: '05:00 PM', slots: 140, status: 'completed',
    description: 'Called at short notice after flooding disrupted supply across the district. 131 units collected in a single day.' },
  { daysFromNow: -21, title: 'Independence Week Drive', organiser: 'Lions Club of Rajkot', venue: 'Rajkot Town Hall', city: 'Rajkot', state: 'Gujarat', startTime: '08:30 AM', endTime: '03:00 PM', slots: 120, status: 'completed',
    description: 'Run alongside the civic celebrations, with 98 donors giving over two days.' },
];
