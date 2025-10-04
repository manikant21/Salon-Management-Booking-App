import { Review, Booking, Salon, Staff } from "../models/index.model.js";
import { Sequelize } from "sequelize";

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { booking_id, salon_rating, staff_rating, reviewForSalon, reviewForStaff, salon_id, staff_id } = req.body;
    if (!booking_id || !salon_rating || !staff_rating) {
      console.log("fiels are missing")
      return res.status(404).json({ success: false, message: "fiels are missing" });

    }

    // 1. Validate rating range
    if (salon_rating < 1 || salon_rating > 5 || staff_rating < 1 || staff_rating > 5) {
      return res.status(400).json({ success: false, message: "Ratings must be between 1 and 5." });
    }

    // 2. Check if booking exists & belongs to user
    const booking = await Booking.findOne({ where: { id: booking_id, user_id: userId } });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // 3. Ensure booking is completed
    if (booking.booking_status !== "completed") {
      return res.status(400).json({ success: false, message: "You can only review after booking is completed." });
    }

    await Booking.update({
      review_done: true
    },
      {
        where: { id: booking_id },
      },
    )

    // 4. Check if review already exists for this booking
    const existingReview = await Review.findOne({ where: { booking_id } });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "Review already submitted for this booking." });
    }

    // 5. Create Review
    const review = await Review.create({
      booking_id,
      user_id: userId,
      salon_id,
      staff_id,
      salon_rating,
      staff_rating,
      reviewForSalon,
      reviewForStaff,
    });

    // 6. Recalculate Salon's average rating
    const salonRatings = await Review.findAll({
      where: { salon_id: booking.salon_id },
      attributes: [[Sequelize.fn("AVG", Sequelize.col("salon_rating")), "avgSalonRating"]],
    });
    const newSalonAvg = parseFloat(salonRatings[0].get("avgSalonRating")).toFixed(1);
    await Salon.update({ averageRating: newSalonAvg }, { where: { id: booking.salon_id } });

    // 7. Recalculate Staff's average rating
    if (booking.staff_id) {
      const staffRatings = await Review.findAll({
        where: { staff_id: booking.staff_id },
        attributes: [[Sequelize.fn("AVG", Sequelize.col("staff_rating")), "avgStaffRating"]],
      });
      const newStaffAvg = parseFloat(staffRatings[0].get("avgStaffRating")).toFixed(1);
      await Staff.update({ averageRating: newStaffAvg }, { where: { id: booking.staff_id } });
    }

    res.status(201).json({ success: true, message: "Review submitted successfully", review });

  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getReviewData = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const review = await Review.findOne({ where: { booking_id: bookingId } });
    if (!review) return res.json({ review: null });
    res.json({ review });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ success: false, message: "Review Data error" });
  }
}