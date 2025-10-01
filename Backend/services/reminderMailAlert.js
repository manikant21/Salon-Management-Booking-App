import cron from "node-cron";
import { Booking, User, Staff, Service } from "../models/index.model.js";
import { sendReminderMail } from "./mail.service.js";


cron.schedule("* * * * *", async () => {
  const now = new Date();
  const fifteenMinLater = new Date(now.getTime() + 15 * 60 * 1000);

  try {
    
    const bookings = await Booking.findAll({
      where: {
        reminder_sent: false 
      },
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: Staff, attributes: ["name", "email"] },
        { model: Service, attributes: ["service_name", "duration"] }
      ]
    });

    for (const booking of bookings) {
     
      const startDatetime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);

      // Check if within 15 min
      if (startDatetime >= now && startDatetime <= fifteenMinLater) {
        // Send mail to user
        await sendReminderMail(
          booking.User.email,
          `Hi ${booking.User.username}, reminder: Your ${booking.Service.service_name} appointment is at ${startDatetime.toLocaleTimeString()}.`
        );

        // Send mail to staff
        await sendReminderMail(
          booking.Staff.email,
          `Hi ${booking.Staff.name}, reminder: You have a ${booking.Service.service_name} appointment with ${booking.User.name} at ${startDatetime.toLocaleTimeString()}.`
        );

        // Mark reminder sent
        booking.reminder_sent = true;
        await booking.save();
      }
    }
  } catch (err) {
    console.error("Error in reminder cron job:", err);
  }
});
