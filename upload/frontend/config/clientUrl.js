// CLIENT_URL may now hold several comma-separated origins (user site + admin
// panel). Anything that builds a public link (the emergency QR) must use the
// FIRST one, which is always the public user site.
module.exports = function clientUrl() {
  const raw = process.env.CLIENT_URL || 'http://localhost:3000';
  return raw.split(',')[0].trim().replace(/\/$/, '');
};
