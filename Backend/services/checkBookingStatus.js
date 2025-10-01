import cron from "node-cron";
import { Booking } from "../models/index.model.js";
import { Op } from "sequelize";

// Runs every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    const now = new Date();
    const updated = await Booking.update(
      { booking_status: "completed" },
      {
        where: {
          booking_status: "confirmed",
          end_time: { [Op.lt]: now }
        }
      }
    );

    if (updated[0] > 0) {
      console.log(`✅ Auto-updated ${updated[0]} bookings to completed`);
    }
  } catch (err) {
    console.error("❌ Error updating booking status:", err);
  }
});
