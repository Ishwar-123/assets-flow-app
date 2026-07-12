const cron = require('node-cron');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');

const initCronJobs = () => {
  // 1. Overdue Returns Scanner (Runs every minute for demo/hackathon purposes)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find allocations that are Active and past their expected return date
      const overdueAllocations = await Allocation.find({
        status: 'Active',
        expectedReturnDate: { $lt: now }
      }).populate('asset').populate('allocatedToUser');

      for (let alloc of overdueAllocations) {
        // Change status to Overdue
        alloc.status = 'Overdue';
        await alloc.save();

        // Send notification to the user who holds it
        if (alloc.allocatedToUser) {
          const Notification = require('../models/Notification');
          // Check if we already sent an overdue notification for this allocation to prevent spamming every minute
          const existingNotif = await Notification.findOne({
            recipient: alloc.allocatedToUser._id,
            relatedEntity: alloc._id,
            type: 'OverdueReturnAlert'
          });

          if (!existingNotif) {
            await Notification.create({
              recipient: alloc.allocatedToUser._id,
              type: 'OverdueReturnAlert',
              message: `URGENT: Your allocation of ${alloc.asset.name} (${alloc.asset.assetTag}) is overdue! Please return it immediately.`,
              relatedEntity: alloc._id,
              relatedEntityType: 'Allocation'
            });

            // Also notify Admins
            const User = require('../models/User');
            const admins = await User.find({ role: 'Admin' });
            for (let admin of admins) {
              await Notification.create({
                recipient: admin._id,
                type: 'OverdueReturnAlert',
                message: `Overdue Alert: ${alloc.allocatedToUser.name} has not returned ${alloc.asset.name} (${alloc.asset.assetTag}).`,
                relatedEntity: alloc._id,
                relatedEntityType: 'Allocation'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error running Overdue Scanner Cron:', error);
    }
  });

  // 2. Booking Reminder (Runs every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
      
      // Find bookings that start in the next 15 minutes, are Upcoming, and haven't been reminded yet
      const upcomingBookings = await Booking.find({
        status: 'Upcoming',
        startTime: { $gt: now, $lte: fifteenMinsFromNow }
      }).populate('resource');

      const Notification = require('../models/Notification');
      
      for (let booking of upcomingBookings) {
        const existingNotif = await Notification.findOne({
          recipient: booking.bookedBy,
          relatedEntity: booking._id,
          type: 'BookingReminder'
        });

        if (!existingNotif) {
          await Notification.create({
            recipient: booking.bookedBy,
            type: 'BookingReminder',
            message: `Reminder: Your booking for ${booking.resource.name} starts in less than 15 minutes!`,
            relatedEntity: booking._id,
            relatedEntityType: 'Booking'
          });
        }
      }
    } catch (error) {
      console.error('Error running Booking Reminder Cron:', error);
    }
  });

  console.log('Cron jobs initialized successfully.');
};

module.exports = initCronJobs;
