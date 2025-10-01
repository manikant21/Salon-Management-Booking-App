import { Router } from "express";
import { authenticateForUser } from "../../middlewares/auth.js";
import { getAvailableSlots, bookAppointment, getBookingById, getAllBooking, cancelBooking, rescheduleBooking } from "../../controllers/booking.controller.js";

const router = Router();

router.post("/appointments/availableSlots", authenticateForUser, getAvailableSlots);
router.post("/appointments/book", authenticateForUser, bookAppointment);
router.get("/:bookingId", authenticateForUser, getBookingById);
router.get("/get/allBooking", authenticateForUser, getAllBooking);
router.delete("/cancel/:bookingId", authenticateForUser, cancelBooking);
router.put("/reschedule/:bookingId", authenticateForUser, rescheduleBooking);


export {router};

