// ============================================================================
// ADMIN ROUTES - the API surface of the separate admin panel.
// ----------------------------------------------------------------------------
// /api/admin/login is the ONLY public endpoint here. Everything below it is
// locked behind protect (valid JWT) + adminOnly (role must be 'admin'), so no
// normal user token can reach any of it, even by guessing the URL.
// ============================================================================

const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/auth');
const runSeed = require('../seed/seedRunner');
const admin = require('../controllers/adminController');
const content = require('../controllers/adminContentController');

// --- public: admin sign-in -------------------------------------------------
router.post('/login', admin.adminLogin);

// --- everything below requires an admin token ------------------------------
router.use(protect, adminOnly);

router.get('/me', admin.getMe);
router.get('/overview', admin.getOverview);

// members
router.get('/users', admin.listUsers);
router.post('/users', admin.createUser);
router.get('/users/:id', admin.getUser);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);

// blood requests
router.get('/requests', admin.listRequests);
router.put('/requests/:id', admin.updateRequestStatus);
router.delete('/requests/:id', admin.deleteRequest);

// appointments
router.get('/appointments', admin.listAppointments);
router.put('/appointments/:id', admin.updateAppointmentStatus);
router.delete('/appointments/:id', admin.deleteAppointment);

// doctors
router.get('/doctors', admin.listDoctors);
router.post('/doctors', admin.createDoctor);
router.put('/doctors/:id', admin.updateDoctor);
router.delete('/doctors/:id', admin.deleteDoctor);

// camps
router.get('/camps', content.listCamps);
router.post('/camps', content.createCamp);
router.get('/camps/:id/registrations', content.getCampRegistrations);
router.put('/camps/:id', content.updateCamp);
router.delete('/camps/:id', content.deleteCamp);

// donor stories
router.get('/stories', content.listStories);
router.post('/stories', content.createStory);
router.put('/stories/:id', content.updateStory);
router.delete('/stories/:id', content.deleteStory);

// guide library
router.get('/guides', content.listGuides);
router.post('/guides', content.createGuide);
router.put('/guides/:id', content.updateGuide);
router.delete('/guides/:id', content.deleteGuide);

// donation records (these drive the leaderboard and certificates)
router.get('/donations', content.listDonations);
router.post('/donations', content.createDonation);
router.delete('/donations/:id', content.deleteDonation);

// certificates - issuing is separate from recording the donation
router.post('/donations/:id/certificate', content.issueCertificate);
router.delete('/donations/:id/certificate', content.revokeCertificate);
router.post('/certificates/issue-all', content.issueAllPending);

// live chat - every message from the site's chat window, as conversations
router.get('/support', content.listSupport);
router.post('/support/:id/reply', content.replySupport);
router.post('/support/:id/close', content.closeSupport);
router.post('/support/:id/reopen', content.reopenSupport);

// maintenance: reload the demo dataset
router.post('/seed', async (req, res) => {
  try {
    const counts = await runSeed();
    res.json({ message: 'Sample data loaded successfully', ...counts });
  } catch (error) {
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
});

module.exports = router;
