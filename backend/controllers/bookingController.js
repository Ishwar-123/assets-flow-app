const Booking = require('../models/Booking');
const Asset = require('../models/Asset');

const getBookings = async (req, res) => {
  try {
    // Basic lazy cron update
    const now = new Date();
    await Booking.updateMany(
      { status: { $in: ['Upcoming', 'Ongoing'] }, endTime: { $lt: now } },
      { $set: { status: 'Completed' } }
    );
    await Booking.updateMany(
      { status: 'Upcoming', startTime: { $lte: now }, endTime: { $gte: now } },
      { $set: { status: 'Ongoing' } }
    );

    const filter = req.query.resourceId ? { resource: req.query.resourceId } : {};
    const bookings = await Booking.find(filter)
      .populate('resource', 'name assetTag')
      .populate('bookedBy', 'name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { resource, bookedForDepartment, startTime, endTime, purpose } = req.body;
    
    const asset = await Asset.findById(resource);
    if (!asset || asset.status === 'Disposed') {
      return res.status(404).json({ message: 'Resource not available' });
    }
    
    // In a real app we'd check if asset.isSharedBookable === true
    // Since we didn't add it yet, we just allow any asset to be booked for now

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    if (newEnd <= newStart) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const overlap = await Booking.findOne({
      resource,
      status: { $in: ['Upcoming', 'Ongoing'] },
      startTime: { $lt: newEnd },
      endTime: { $gt: newStart }
    });

    if (overlap) {
      return res.status(400).json({
        message: 'This resource is already booked for the selected time slot.',
        conflictingBooking: overlap
      });
    }

    const booking = await Booking.create({
      resource,
      bookedBy: req.user.id,
      bookedForDepartment,
      startTime: newStart,
      endTime: newEnd,
      purpose
    });

    // TODO: Add activityLog + Notification here later

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rescheduleBooking = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    if (newEnd <= newStart) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const overlap = await Booking.findOne({
      _id: { $ne: booking._id },
      resource: booking.resource,
      status: { $in: ['Upcoming', 'Ongoing'] },
      startTime: { $lt: newEnd },
      endTime: { $gt: newStart }
    });

    if (overlap) {
      return res.status(400).json({
        message: 'This resource is already booked for the selected time slot.',
        conflictingBooking: overlap
      });
    }

    booking.startTime = newStart;
    booking.endTime = newEnd;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBookings, createBooking, cancelBooking, rescheduleBooking };
