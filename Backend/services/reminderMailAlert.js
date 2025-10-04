import cron from "node-cron";
import { Booking, User, Staff, Service } from "../models/index.model.js";
import { sendReminderMail } from "./mail.service.js";
import dayjs from "dayjs";


// cron.schedule("* * * * *", async () => {
//   const now = new Date();
//   console.log(now);
//   const fifteenMinLater = new Date(now.getTime() + 15 * 60 * 1000);
//   console.log(fifteenMinLater);

//   try {

//     const bookings = await Booking.findAll({
//       where: {
//         reminder_sent: false
//       },
//       include: [
//         { model: User, attributes: ["username", "email"] },
//         { model: Staff, attributes: ["name", "email"] },
//         { model: Service, attributes: ["service_name", "duration"] }
//       ]
//     });

//     for (const booking of bookings) {

//       // const startDatetime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
//       // console.log(startDatetime);
//       const startDatetime = dayjs(`${booking.booking_date} ${booking.booking_time}`, "YYYY-MM-DD HH:mm").toDate();
//       console.log("Parsed Start:", startDatetime);
//       // Check if within 15 min
//       if (startDatetime >= now && startDatetime <= fifteenMinLater) {
//         // Send mail to user
//         await sendReminderMail(
//           booking.User.email,
//           `Hi ${booking.User.username}, reminder: Your ${booking.Service.service_name} appointment is at ${startDatetime.toLocaleTimeString()}.`
//         );

//         // Send mail to staff
//         await sendReminderMail(
//           booking.Staff.email,
//           `Hi ${booking.Staff.name}, reminder: You have a ${booking.Service.service_name} appointment with ${booking.User.name} at ${startDatetime.toLocaleTimeString()}.`
//         );

//         // Mark reminder sent
//         booking.reminder_sent = true;
//         await booking.save();
//       }
//     }
//   } catch (err) {
//     console.error("Error in reminder cron job:", err);
//   }
// });


cron.schedule("* * * * *", async () => {
  const now = new Date();
  const fifteenMinLater = new Date(now.getTime() + 15 * 60 * 1000);

  try {
    const bookings = await Booking.findAll({
      where: { reminder_sent: false, booking_status: "confirmed" },
      include: [
        { model: User, attributes: ["username", "email"] },
        { model: Staff, attributes: ["name", "email"] },
        { model: Service, attributes: ["service_name", "duration"] }
      ]
    });
    console.log(bookings);

    for (const booking of bookings) {
      // ✅ Ensure date is in YYYY-MM-DD string format
      const dateStr =
        booking.booking_date instanceof Date
          ? booking.booking_date.toISOString().split("T")[0]
          : String(booking.booking_date);

      // ✅ Ensure time is HH:mm
      const timeStr = String(booking.booking_time).slice(0, 5);
      console.log("Mani",timeStr)

      const startDatetime = new Date(`${dateStr}T${timeStr}:00`);
      console.log("Mani", startDatetime);

      if (isNaN(startDatetime.getTime())) {
        console.warn(`Skipping invalid datetime for booking ${booking.id}`, dateStr, timeStr);
        continue;
      }

      if (startDatetime >= now && startDatetime <= fifteenMinLater) {
        // send mails here...
        //  Send mail to user
        await sendReminderMail(
          booking.User.email,
          `Hi ${booking.User.username}, reminder: Your ${booking.Service.service_name} appointment is at ${startDatetime.toLocaleTimeString()}.`
        );

        // Send mail to staff
        await sendReminderMail(
          booking.Staff.email,
          `Hi ${booking.Staff.name}, reminder: You have a ${booking.Service.service_name} appointment with ${booking.User.username} at ${startDatetime.toLocaleTimeString()}.`
        );

        console.log(`⏰ Reminder for booking ${booking.id} at ${startDatetime}`);

        booking.reminder_sent = true;
        await booking.save();
      }
    }
  } catch (err) {
    console.error("Error in reminder cron job:", err);
  }
});