// SAMPLE blood requests for the public requests board.
//
// WHY THIS FILE EXISTS
// The seed created camps, stories, guides and donation history but no
// DonationRequest records, so /requests - one of the core features - rendered
// "No requests yet." on a freshly seeded database.
//
// donorIndex points at a row in the combined donor list (donorData.js then
// donorDataIndia.js); the seed runner swaps it for that user's real _id so
// the board can show a name and a contact number.
//
// hoursAgo backdates createdAt, which is what the board sorts by, so the list
// reads like a live feed rather than everything arriving at once.
// closedHoursAgo backdates fulfilledAt or cancelledAt by the same measure, so
// "raised Tuesday, answered Wednesday" is visible on the board.
//
// Fictional. Hospital names come from the directories in hospitalData.js and
// hospitalDataIndia.js.
module.exports = [
  { donorIndex: 12, bloodGroupNeeded: 'B-', unitsNeeded: 3, hospital: 'New Civil Hospital', location: 'Surat', urgency: 'critical', status: 'pending', hoursAgo: 2 },
  { donorIndex: 47, bloodGroupNeeded: 'O-', unitsNeeded: 2, hospital: 'Sterling Hospital', location: 'Rajkot', urgency: 'critical', status: 'pending', hoursAgo: 4 },
  { donorIndex: 3, bloodGroupNeeded: 'A+', unitsNeeded: 3, hospital: 'Civil Hospital', location: 'Ahmedabad', urgency: 'critical', status: 'pending', hoursAgo: 7 },
  { donorIndex: 88, bloodGroupNeeded: 'AB-', unitsNeeded: 4, hospital: 'SSG Hospital', location: 'Vadodara', urgency: 'critical', status: 'pending', hoursAgo: 9 },
  { donorIndex: 61, bloodGroupNeeded: 'B+', unitsNeeded: 1, hospital: 'Sir T Hospital', location: 'Bhavnagar', urgency: 'urgent', status: 'pending', hoursAgo: 14 },
  { donorIndex: 25, bloodGroupNeeded: 'O+', unitsNeeded: 1, hospital: 'Guru Gobind Singh Hospital', location: 'Jamnagar', urgency: 'urgent', status: 'pending', hoursAgo: 19 },
  { donorIndex: 104, bloodGroupNeeded: 'A-', unitsNeeded: 3, hospital: 'Navsari Civil Hospital', location: 'Navsari', urgency: 'urgent', status: 'pending', hoursAgo: 23 },
  { donorIndex: 70, bloodGroupNeeded: 'B+', unitsNeeded: 1, hospital: 'Shardaben Hospital', location: 'Ahmedabad', urgency: 'urgent', status: 'pending', hoursAgo: 28 },
  { donorIndex: 38, bloodGroupNeeded: 'AB+', unitsNeeded: 2, hospital: 'Mahavir Hospital', location: 'Surat', urgency: 'urgent', status: 'pending', hoursAgo: 33 },
  { donorIndex: 117, bloodGroupNeeded: 'O-', unitsNeeded: 3, hospital: 'Civil Hospital', location: 'Gandhinagar', urgency: 'urgent', status: 'pending', hoursAgo: 41 },
  { donorIndex: 9, bloodGroupNeeded: 'B-', unitsNeeded: 1, hospital: 'Kiran Multi Super Speciality Hospital', location: 'Surat', urgency: 'urgent', status: 'pending', hoursAgo: 46 },
  { donorIndex: 132, bloodGroupNeeded: 'A+', unitsNeeded: 3, hospital: 'Sterling Hospital', location: 'Bhavnagar', urgency: 'urgent', status: 'pending', hoursAgo: 52 },
  { donorIndex: 56, bloodGroupNeeded: 'O+', unitsNeeded: 1, hospital: 'Apollo Hospital', location: 'Gandhinagar', urgency: 'urgent', status: 'fulfilled', hoursAgo: 60, closedHoursAgo: 10 },
  { donorIndex: 21, bloodGroupNeeded: 'B+', unitsNeeded: 2, hospital: 'Zydus Hospital', location: 'Ahmedabad', urgency: 'routine', status: 'fulfilled', hoursAgo: 74, closedHoursAgo: 25 },
  { donorIndex: 95, bloodGroupNeeded: 'A+', unitsNeeded: 1, hospital: 'Wockhardt Hospital', location: 'Surat', urgency: 'routine', status: 'fulfilled', hoursAgo: 88, closedHoursAgo: 16 },
  { donorIndex: 43, bloodGroupNeeded: 'AB+', unitsNeeded: 2, hospital: 'Civil Hospital', location: 'Junagadh', urgency: 'routine', status: 'fulfilled', hoursAgo: 102, closedHoursAgo: 18 },
  { donorIndex: 128, bloodGroupNeeded: 'O-', unitsNeeded: 1, hospital: 'Bhailal Amin General Hospital', location: 'Vadodara', urgency: 'routine', status: 'fulfilled', hoursAgo: 119, closedHoursAgo: 68 },
  { donorIndex: 66, bloodGroupNeeded: 'B-', unitsNeeded: 1, hospital: 'Sterling Hospital', location: 'Mehsana', urgency: 'routine', status: 'fulfilled', hoursAgo: 136, closedHoursAgo: 55 },
  { donorIndex: 15, bloodGroupNeeded: 'A-', unitsNeeded: 2, hospital: 'Red Cross Blood Centre', location: 'Anand', urgency: 'routine', status: 'fulfilled', hoursAgo: 160, closedHoursAgo: 27 },
  { donorIndex: 110, bloodGroupNeeded: 'O+', unitsNeeded: 1, hospital: 'Civil Hospital', location: 'Porbandar', urgency: 'routine', status: 'fulfilled', hoursAgo: 190, closedHoursAgo: 32 },
  { donorIndex: 80, bloodGroupNeeded: 'AB-', unitsNeeded: 1, hospital: 'Sanjivani Hospital', location: 'Botad', urgency: 'routine', status: 'cancelled', hoursAgo: 210, closedHoursAgo: 58 },
  { donorIndex: 34, bloodGroupNeeded: 'B+', unitsNeeded: 1, hospital: 'Shraddha Surgical Hospital', location: 'Morbi', urgency: 'routine', status: 'cancelled', hoursAgo: 245, closedHoursAgo: 96 },
  { donorIndex: 151, bloodGroupNeeded: 'O-', unitsNeeded: 4, hospital: 'Government General Hospital', location: 'Mumbai', urgency: 'critical', status: 'pending', hoursAgo: 3 },
  { donorIndex: 168, bloodGroupNeeded: 'B+', unitsNeeded: 2, hospital: 'District Blood Centre', location: 'Pune', urgency: 'urgent', status: 'pending', hoursAgo: 11 },
  { donorIndex: 185, bloodGroupNeeded: 'A+', unitsNeeded: 3, hospital: 'Government Medical College Hospital', location: 'Jaipur', urgency: 'urgent', status: 'pending', hoursAgo: 26 },
  { donorIndex: 202, bloodGroupNeeded: 'AB+', unitsNeeded: 1, hospital: 'District Civil Hospital', location: 'Lucknow', urgency: 'routine', status: 'pending', hoursAgo: 44 },
  { donorIndex: 219, bloodGroupNeeded: 'O+', unitsNeeded: 1, hospital: 'Municipal General Hospital', location: 'Bengaluru', urgency: 'urgent', status: 'fulfilled', hoursAgo: 96, closedHoursAgo: 30 },
  { donorIndex: 236, bloodGroupNeeded: 'B-', unitsNeeded: 4, hospital: 'ESIC Model Hospital', location: 'Chennai', urgency: 'critical', status: 'fulfilled', hoursAgo: 130, closedHoursAgo: 18 },
  { donorIndex: 253, bloodGroupNeeded: 'A-', unitsNeeded: 1, hospital: 'District Blood Centre', location: 'Kolkata', urgency: 'routine', status: 'pending', hoursAgo: 58 },
  { donorIndex: 270, bloodGroupNeeded: 'O+', unitsNeeded: 2, hospital: 'Government General Hospital', location: 'Indore', urgency: 'urgent', status: 'cancelled', hoursAgo: 150, closedHoursAgo: 70 },
];
