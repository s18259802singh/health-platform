// Handles: booking appointments and preventing double-booking.
// Double-booking prevention has TWO layers:
//  1) A unique index in the Appointment model (database level - the strongest guarantee)
//  2) A manual check here (so we can send back a friendly error message)

const Appointment = require('../models/Appointment');

// POST /api/appointments
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'doctorId, appointmentDate and appointmentTime are required' });
    }

    const alreadyBooked = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $ne: 'cancelled' },
    });
    if (alreadyBooked) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }

    const appointment = await Appointment.create({
      userId: req.user.id,
      doctorId,
      appointmentDate,
      appointmentTime,
      status: 'pending',
    });

    res.status(201).json(appointment);
  } catch (error) {
    // error code 11000 = MongoDB "duplicate key" error, thrown by the unique index
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/appointments/my  (logged-in user's own bookings)
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate({ path: 'doctorId', select: 'name specialization hospitalId', populate: { path: 'hospitalId', select: 'name' } })
      .sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    appointment.status = 'cancelled';
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { bookAppointment, getMyAppointments, cancelAppointment };
