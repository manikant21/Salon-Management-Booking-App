import {Service, Salon, Booking, Staff, User, Payment} from "../models/index.model.js";
import { Op } from "sequelize";

export const getAvailableSlots = async (req, res) => {
  try {
    const { serviceId, staffId, date } = req.body;
    const userId= req.user.id;

    // 1. Find service (which includes salon_id)
    const service = await Service.findByPk(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // // 2. Get salon's working hours
    // const salon = await Salon.findByPk(service.salon_id);
    // if (!salon) return res.status(404).json({ message: "Salon not found" });

    const duration = service.duration;

    // Convert HH:MM string to minutes
    const toMinutes = (timeStr) => {
      const [hh, mm] = timeStr.split(":").map(Number);
      return hh * 60 + mm;
    };

    let start = toMinutes(service.open_time_for_services);   // e.g. "09:30" -> 570
    let end = toMinutes(service.close_time_for_services);     // e.g. "19:00" -> 1140

    const slots = [];

    for (let t = start; t + duration <= end; t += duration) {
      const hh = Math.floor(t / 60).toString().padStart(2, "0");
      const mm = (t % 60).toString().padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }

    // 3. Get booked slots
    const booked = await Booking.findAll({
      where: {
        service_id: serviceId,
        ...(staffId ? { staff_id: staffId } : {}),
        booking_date: date,
        booking_status: "confirmed"
      }
    });

    const bookedTimes = booked.map(b => b.booking_time);
    const available = slots.filter(s => !bookedTimes.includes(s));

    res.json(available);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// export const bookAppointment = async (req, res, next) => {
//   try {
//     const { salonId, serviceId, staffId, booking_date, booking_time } = req.body;
//     const userId = req.user.id;

//     // 1. Get service duration (assume in minutes)
//     const service = await Service.findByPk(serviceId);
//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }

//     const startTime = booking_time; // string like "14:00"
//     const startDateTime = new Date(`${booking_date}T${startTime}:00`);

//     const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

//     // 2. Check overlap with existing bookings for same staff
//     const conflict = await Booking.findOne({
//       where: {
//         staff_id: staffId,
//         booking_date,
//         booking_status: "confirmed",
//         [Op.or]: [
//           {
//             start_time: { [Op.lt]: endDateTime }, // existing start < new end
//             end_time: { [Op.gt]: startDateTime }  // existing end > new start
//           }
//         ]
//       }
//     });

//     if (conflict) {
//       return res.status(400).json({
//         message: "This staff already has a booking overlapping with the selected time"
//       });
//     }

//     // 3. Save booking
//     const newBooking = await Booking.create({
//       user_id: userId,
//       salon_id: salonId,
//       service_id: serviceId,
//       staff_id: staffId,
//       booking_date,
//       start_time: startDateTime,
//       end_time: endDateTime,
//       booking_status: "confirmed"
//     });

//     res.status(201).json({ success: true, booking: newBooking });

//   } catch (err) {
//     console.error("Error in booking appointment:", err);
//     res.status(500).json({ message: "Error booking appointment" });
//   }
// };


export const bookAppointment = async (req, res, next) => {
  try {
    const { salonId, serviceId, staffId, booking_date, booking_time } = req.body;
    const userId = req.user.id;

    // 1. Get service duration
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 2. Calculate requested booking time range
    const startDateTime = new Date(`${booking_date}T${booking_time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + service.duration * 60000);

    // 3. Fetch all confirmed bookings for the same staff & date
    const existingBookings = await Booking.findAll({
      where: {
        staff_id: staffId,
        booking_date,
        booking_status: "confirmed"
      },
      include: [Service] // so we can get each service duration
    });

    // 4. Check overlap with each booking
    for (let existing of existingBookings) {
      const existingStart = new Date(`${existing.booking_date}T${existing.booking_time}:00`);
      const existingEnd = new Date(existingStart.getTime() + existing.Service.duration * 60000);

      if (startDateTime < existingEnd && endDateTime > existingStart) {
        return res.status(400).json({
          message: "This staff already has a booking overlapping with the selected time"
        });
      }
    }


    // 5. Save new booking
    const booking = await Booking.create({
      user_id: userId,
      salon_id: salonId,
      service_id: serviceId,
      staff_id: staffId,
      booking_date,
      booking_time,
      duration: service.duration
      // booking_status: "confirmed"
    });

    res.status(201).json({ success: true, booking });

  } catch (err) {
    console.error("Error in booking appointment:", err);
    next(err);
  }
};













// bookingController.js
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId, {
      include: [Salon, Service, Staff, User] // Sequelize associations
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({
      success: true,
      booking: {
        id: booking.id,
        salonName: booking.Salon.name,
        serviceName: booking.Service.service_name,
        staffName: booking.Staff.name,
        date: booking.booking_date,
        slot: booking.booking_time,
        customerName: booking.User.username,
        price: booking.Service.price
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching booking" });
  }
};

export const getAllBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;

    
    // Update expired bookings first
    // await Booking.update(
    //   { booking_status: "completed" },
    //   {
    //     where: {
    //       user_id: userId,
    //       booking_status: "confirmed",
    //       end_time: { [Op.lt]: now }
    //     }
    //   }
    // );

    const booking = await Booking.findAll({
      where: {
        user_id: userId
      },
       include: [Salon, Service, Staff, User, Payment],
       order: [['booking_date', 'DESC']]
     
    })

    // if (!booking || booking.length === 0) {
    //   return res.status(404).json({ success: false, message: "No bookings found" });
    // }
    // console.log(booking);
    res.status(200).json({booking});

  } catch (err) {
    console.log("Error occured in feching all bookings ",err);
    next();
  }
}

// booking.controller.js
export const rescheduleBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { new_date, new_time } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: userId }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const oldStart = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
    const now = new Date();
    const diffHours = (oldStart - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ message: "Cannot reschedule within 2 hours of booking time" });
    }

    booking.booking_date = new_date;
    booking.booking_time = new_time;
    await booking.save();

    res.json({ success: true, message: "Booking rescheduled successfully", booking });
  } catch (err) {
    console.error("Reschedule booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;


    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: userId },
      include: [Payment, Staff],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const now = new Date();
    const bookingTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
    const diffHours = (bookingTime - now) / (1000 * 60 * 60);

    if (diffHours < 4) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled within 4 hours of the slot",
      });
    }

    // 3. Refund if already paid
    if (booking.Payment && booking.Payment.status === "paid") {
      // Refund logic (via payment gateway API)...
      await booking.Payment.update({ status: "refunded" });
    }

    // 4. Update booking status
    await booking.update({ status: "cancelled" });

    // 5. Free up staff slot (depends on your logic, usually staff availability is checked dynamically based on active bookings)
    // For example, just mark booking as cancelled and staff will automatically be available since booking won't block them anymore.

    return res.status(200).json({ success: true, message: "Booking cancelled successfully" });

  } catch (err) {
    console.error("Error in cancelBooking:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
