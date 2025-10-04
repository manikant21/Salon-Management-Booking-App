import { Admin, User, SalonOwner, Salon, Booking, Staff, Service, Specialization, Payment, Review } from "../models/index.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/server.config.js";

function generateAccessToken(id, name) {
    return jwt.sign({ adminId: id, name: name }, JWT_SECRET);
}


export const checkCredential = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({
            where: {
                email: email
            }
        })
        if (!admin) {
            return res.status(404).json({ success: false, msg: "Admin not found" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: "Admin not authorized" });
        }
        return res.status(200).json({ success: true, msg: "Admin login sucessful", adminId: admin.id, token: generateAccessToken(admin.id, admin.usernamename), name: admin.username });
    } catch (err) {
        console.error("Error in admin login :", err);
        next(err);
    }
}

export const getAllUser = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error in fetching user record :", err);
        next(err);
    }
}


export const getAllOwner = async (req, res, next) => {
    try {
        const owners = await SalonOwner.findAll({
            include: [
                {
                    model: Salon,
                    attributes: ["id", "name"]
                }
            ]

        });
        console.log(owners);
        res.status(200).json({ success: true, data: owners });
    } catch (err) {
        console.error("Error in fetching owner record :", err);
        next(err);
    }
}


export const getAllSalon = async (req, res, next) => {
    try {
        const salons = await Salon.findAll({
            include: [
                {
                    model: SalonOwner,
                    attributes: ["id", "name"]
                },
                {
                    model: Service,
                    attributes: ["id", "service_name"],
                }
            ]
        });
        res.status(200).json({ success: true, data: salons });
    } catch (err) {
        console.error("Error in fetching salon record :", err);
        next(err);
    }
}


export const getAllBooking = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            where: {
                booking_status: "confirmed"
            },
            include: [
                {
                    model: Payment,
                    attributes: ["amount", "status"]
                },
                {
                    model: User,
                    attributes: ["username"]
                },
                {
                    model: Salon,
                    attributes: ["name"]
                },
                {
                    model: Service,
                    attributes: ["service_name"]
                },
                {
                    model: Staff,
                    attributes: ["name"]
                }
            ]
        }
        );
        console.log(bookings[0].User);
        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        console.error("Error in fetching  booking record :", err);
        next(err);
    }
}


export const getAllStaff = async (req, res, next) => {
    try {
        const staffs = await Staff.findAll({
            include: [
                {
                    model: Specialization,
                    attributes: ["id", "name"]
                },
            ]
        });
        // console.log(staffs);
        res.status(200).json({ success: true, data: staffs });
    } catch (err) {
        console.error("Error in fetching staff record :", err);
        next(err);
    }
}

export const getAllReview = async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            include: [
                {
                    model: User,
                    attributes: ["username"]
                },
                {
                    model: Salon,
                    attributes: ["name"]
                },
                {
                    model: Staff,
                    attributes: ["name"]
                }
            ]
        })
         res.status(200).json({ success: true, data: reviews });
    } catch (err) {
         console.error("Error in fetching rating record :", err);
        next(err);
    }
}

// Delete Salon
export const deleteSalon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salon = await Salon.findByPk(id);

    if (!salon) return res.status(404).json({ success: false, message: "Salon not found" });

    await salon.destroy();  // cascade will delete related staff, services, bookings
    res.status(200).json({ success: true, message: "Salon and related data deleted" });
  } catch (err) {
    console.error("Error deleting salon:", err);
    next(err);
  }
};

// Delete User
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await user.destroy();  // cascade will delete user bookings if association set
    res.status(200).json({ success: true, message: "User and related bookings deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    next(err);
  }
};

// Delete Owner
export const deleteOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owner = await SalonOwner.findByPk(id);

    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    await owner.destroy();  // cascade will delete salons → staff/services/bookings
    res.status(200).json({ success: true, message: "Owner and related salons deleted" });
  } catch (err) {
    console.error("Error deleting owner:", err);
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);

    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    await owner.destroy();  // cascade will delete salons → staff/services/bookings
    res.status(200).json({ success: true, message: "Review and reating related to salon and staff  deleted" });
  } catch (err) {
    console.error("Error deleting owner:", err);
    next(err);
  }
};


export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    // const userId = req.user.id;


    const booking = await Booking.findOne({
      where: { id: bookingId},
      include: [Payment, Staff],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // const now = new Date();
    // const bookingTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
    // const diffHours = (bookingTime - now) / (1000 * 60 * 60);

    // if (diffHours < 4) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Booking cannot be cancelled within 4 hours of the slot",
    //   });
    // }

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


