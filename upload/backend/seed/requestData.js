// SAMPLE blood requests for the public requests board.
//
// WHY THIS FILE EXISTS
// The seed created camps, stories, guides and donation history but no
// DonationRequest records, so /requests - one of the core features - rendered
// "No requests yet." on a freshly seeded database.
//
// donorIndex points at a row in donorData.js; the seed runner swaps it for
// that user's real _id so the board can show a name and a contact number.
// hoursAgo backdates createdAt, which is what the board sorts by, so the list
// reads like a live feed rather than everything arriving at once.
//
// Fictional. Hospital names come from the directory in hospitalData.js.
module.exports = [
  { donorIndex: 12, bloodGroupNeeded: 'B-',  location: 'New Civil Hospital, Majura Gate, Surat',            status: 'pending',   hoursAgo: 2 },
  { donorIndex: 47, bloodGroupNeeded: 'O-',  location: 'Sterling Hospital, Race Course Road, Rajkot',        status: 'pending',   hoursAgo: 4 },
  { donorIndex: 3,  bloodGroupNeeded: 'A+',  location: 'Civil Hospital, Asarwa, Ahmedabad',                  status: 'pending',   hoursAgo: 7 },
  { donorIndex: 88, bloodGroupNeeded: 'AB-', location: 'SSG Hospital, Jail Road, Vadodara',                  status: 'pending',   hoursAgo: 9 },
  { donorIndex: 61, bloodGroupNeeded: 'B+',  location: 'Sir T Hospital, Kalanala, Bhavnagar',                status: 'pending',   hoursAgo: 14 },
  { donorIndex: 25, bloodGroupNeeded: 'O+',  location: 'Guru Gobind Singh Hospital, Jamnagar',               status: 'pending',   hoursAgo: 19 },
  { donorIndex: 104, bloodGroupNeeded: 'A-', location: 'Navsari Civil Hospital, Navsari',                    status: 'pending',   hoursAgo: 23 },
  { donorIndex: 70, bloodGroupNeeded: 'B+',  location: 'Shardaben Hospital, Saraspur, Ahmedabad',            status: 'pending',   hoursAgo: 28 },
  { donorIndex: 38, bloodGroupNeeded: 'AB+', location: 'Mahavir Hospital, Ring Road, Surat',                 status: 'pending',   hoursAgo: 33 },
  { donorIndex: 117, bloodGroupNeeded: 'O-', location: 'Civil Hospital, Gandhinagar',                        status: 'pending',   hoursAgo: 41 },
  { donorIndex: 9,  bloodGroupNeeded: 'B-',  location: 'Kiran Multi Super Speciality Hospital, Surat',       status: 'pending',   hoursAgo: 46 },
  { donorIndex: 132, bloodGroupNeeded: 'A+', location: 'Sterling Hospital, Bhavnagar',                       status: 'pending',   hoursAgo: 52 },

  { donorIndex: 56, bloodGroupNeeded: 'O+',  location: 'Apollo Hospital, Bhat, Gandhinagar',                 status: 'fulfilled', hoursAgo: 60 },
  { donorIndex: 21, bloodGroupNeeded: 'B+',  location: 'Zydus Hospital, Thaltej, Ahmedabad',                 status: 'fulfilled', hoursAgo: 74 },
  { donorIndex: 95, bloodGroupNeeded: 'A+',  location: 'Wockhardt Hospital, Athwalines, Surat',              status: 'fulfilled', hoursAgo: 88 },
  { donorIndex: 43, bloodGroupNeeded: 'AB+', location: 'Civil Hospital, Junagadh',                           status: 'fulfilled', hoursAgo: 102 },
  { donorIndex: 128, bloodGroupNeeded: 'O-', location: 'Bhailal Amin General Hospital, Vadodara',            status: 'fulfilled', hoursAgo: 119 },
  { donorIndex: 66, bloodGroupNeeded: 'B-',  location: 'Sterling Hospital, Mehsana',                         status: 'fulfilled', hoursAgo: 136 },
  { donorIndex: 15, bloodGroupNeeded: 'A-',  location: 'Red Cross Blood Centre, Anand',                      status: 'fulfilled', hoursAgo: 160 },
  { donorIndex: 110, bloodGroupNeeded: 'O+', location: 'Civil Hospital, Porbandar',                          status: 'fulfilled', hoursAgo: 190 },

  { donorIndex: 80, bloodGroupNeeded: 'AB-', location: 'Sanjivani Hospital, Botad',                          status: 'cancelled', hoursAgo: 210 },
  { donorIndex: 34, bloodGroupNeeded: 'B+',  location: 'Shraddha Surgical Hospital, Morbi',                   status: 'cancelled', hoursAgo: 245 },
];
