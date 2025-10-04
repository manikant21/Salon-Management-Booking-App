import cron from "node-cron";
import { Booking, Service } from "../models/index.model.js";
import { Op } from "sequelize";




// Helper: turn "YYYY-MM-DD" and "HH:MM" or "HH:MM:SS" into a JS Date (local time)
function toLocalDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  // Normalize dateStr if it's a Date object or contains a `T`
  if (dateStr instanceof Date) {
    dateStr = dateStr.toISOString().slice(0, 10); // YYYY-MM-DD
  } else if (typeof dateStr === "string" && dateStr.includes("T")) {
    dateStr = dateStr.split("T")[0];
  }

  // Normalize timeStr
  timeStr = (timeStr || "00:00:00").trim();
  // Strip milliseconds / timezone suffix if present
  if (timeStr.includes(".")) timeStr = timeStr.split(".")[0];
  if (timeStr.endsWith("Z")) timeStr = timeStr.replace(/Z$/, "");

  // If time is HH:MM -> make HH:MM:SS
  const parts = timeStr.split(":").map(s => s || "0");
  let hh = Number(parts[0] ?? 0);
  let mm = Number(parts[1] ?? 0);
  let ss = Number(parts[2] ?? 0);

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day || Number.isNaN(hh) || Number.isNaN(mm) || Number.isNaN(ss)) {
    return null;
  }

  // Create local Date using numeric components (avoid ambiguous Date.parse)
  return new Date(year, month - 1, day, hh, mm, ss);
}

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    // console.log(now);
    // Only fetch confirmed bookings for today or earlier (small perf optimization)
    const todayStr = new Date().toISOString().slice(0, 10);

    // console.log(todayStr);

    const confirmedBookings = await Booking.findAll({
      where: {
        booking_status: "confirmed",
        // booking_date: { [Op.lte]: todayStr }
      },
      include: [Service]
    });
    // console.log(confirmedBookings);

    let updatedCount = 0;

    for (const booking of confirmedBookings) {
      // ensure we have service duration
      const svc = booking.Service;
      // if (!svc) {
      //   console.warn(`Booking ${booking.id} has no Service associated — skipping.`);
      //   continue;
      // }

      // parse date + time robustly
      const startDateTime = toLocalDateTime(booking.booking_date, booking.booking_time);
      // console.log(startDateTime)
      if (!startDateTime || isNaN(startDateTime.getTime())) {
        console.warn(
          `Booking ${booking.id} produced invalid start datetime.`,
          "booking_date:", booking.booking_date,
          "booking_time:", booking.booking_time
        );
        continue;
      }

      const durationMinutes = Number(svc.duration) || 0;
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

      // console.log(endDateTime);
      // console.log(now);

      // Debug logs (comment out if noisy)
      // console.debug(`Booking ${booking.id} start=${startDateTime.toISOString()} end=${endDateTime.toISOString()} now=${now.toISOString()}`);

      if (endDateTime < now) {
        await Booking.update(
          { booking_status: "completed" },
          { where: { id: booking.id } }
        );
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ Auto-updated ${updatedCount} bookings to completed`);
    }
  } catch (err) {
    console.error("❌ Error updating booking status:", err);
  }
});




// cron.schedule("* * * * *", async () => {
//   try {
//     const now = new Date();

//     // 1. Get all confirmed bookings with their services
//     const confirmedBookings = await Booking.findAll({
//       where: { booking_status: "confirmed" },
//       include: [Service]
//     });

//     let updatedCount = 0;
//     // console.log(confirmedBookings);

//     // 2. Loop through each booking and calculate end time
//     for (let booking of confirmedBookings) {
//       // console.log(booking.Service);
//       if (!booking.Service) continue; // skip if no service attached

//       const startDateTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
//       const endDateTime = new Date(startDateTime.getTime() + booking.Service.duration * 60000);
//       console.log(endDateTime);
//       console.log(now);

//       // 3. If booking ended already → mark as completed
//       if (endDateTime < now) {
//         await Booking.update(
//           { booking_status: "completed" }, {
//           where: {
//             id: booking.id
//           }
//         },);
//         updatedCount++;
//       }
//     }

//     if (updatedCount > 0) {
//       console.log(`✅ Auto-updated ${updatedCount} bookings to completed`);
//     }
//   } catch (err) {
//     console.error("❌ Error updating booking status:", err);
//   }
// });

// Runs every 30 minutes
// cron.schedule("* * * * *", async () => {
//   try {
//     const now = new Date();
//     const updated = await Booking.update(
//       { booking_status: "completed" },
//       {
//         where: {
//           booking_status: "confirmed",
//           end_time: { [Op.lt]: now }
//         }
//       }
//     );

//     if (updated[0] > 0) {
//       console.log(`✅ Auto-updated ${updated[0]} bookings to completed`);
//     }
//   } catch (err) {
//     console.error("❌ Error updating booking status:", err);
//   }
// });
