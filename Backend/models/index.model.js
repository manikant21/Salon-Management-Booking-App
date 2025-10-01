import Salon from "./salon.model.js";
import Staff from "./staff.model.js";
import Specialization from "./specialization.model.js";
import Service from "./service.model.js";
import StaffSpecialization from "./staffSpecialization.model.js";
import User from "./user.model.js";
import SalonOwner from "./owner.model.js";
import Review from "./review.model.js";
import Payment from "./payment.model.js";
import Booking from "./booking.model.js";


// Salon → Services (1:M)
Salon.hasMany(Service, { foreignKey: "salon_id", onDelete: "CASCADE" });
Service.belongsTo(Salon, { foreignKey: "salon_id" });

// Salon → Staff (1:M)
Salon.hasMany(Staff, { foreignKey: "salon_id", onDelete: "CASCADE" });
Staff.belongsTo(Salon, { foreignKey: "salon_id" });

// Staff ↔ Specialization (M:N via StaffSpecialization)
Staff.belongsToMany(Specialization, {
  through: StaffSpecialization,
  foreignKey: "staff_id",
  otherKey: "specialization_id"
});

Specialization.belongsToMany(Staff, {
  through: StaffSpecialization,
  foreignKey: "specialization_id",
  otherKey: "staff_id"
});

Salon.hasMany(Specialization, { foreignKey: "salon_id", onDelete: "CASCADE" });
Specialization.belongsTo(Salon, { foreignKey: "salon_id" });



Review.belongsTo(Booking, { foreignKey: "booking_id", unique: true });
Review.belongsTo(User, { foreignKey: "user_id" });
Review.belongsTo(Salon, { foreignKey: "salon_id" });
Review.belongsTo(Staff, { foreignKey: "staff_id" });

Booking.hasOne(Review, { foreignKey: "booking_id" });
User.hasMany(Review, { foreignKey: "user_id" });
Salon.hasMany(Review, { foreignKey: "salon_id" });
Staff.hasMany(Review, { foreignKey: "staff_id" });

Payment.belongsTo(Booking, { foreignKey: "booking_id", unique: true });
Payment.belongsTo(User, { foreignKey: "user_id" });

Booking.hasOne(Payment, { foreignKey: "booking_id" });
User.hasMany(Payment, { foreignKey: "user_id" });

// User ↔ Booking (1:M)
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

// Salon ↔ Booking (1:M)
Salon.hasMany(Booking, { foreignKey: "salon_id" });
Booking.belongsTo(Salon, { foreignKey: "salon_id" });

// Service ↔ Booking (1:M)
Service.hasMany(Booking, { foreignKey: "service_id" });
Booking.belongsTo(Service, { foreignKey: "service_id" });

// Staff ↔ Booking (1:M)
Staff.hasMany(Booking, { foreignKey: "staff_id" });
Booking.belongsTo(Staff, { foreignKey: "staff_id" });

// Admin ↔ Booking (1:M)
// Admin.hasMany(Booking, { foreignKey: "admin_id" });
// Booking.belongsTo(Admin, { foreignKey: "admin_id" });

// Payment ↔ Booking (1:1)
// Payment.belongsTo(Booking, { foreignKey: "booking_id", unique: true });
Booking.hasOne(Payment, { foreignKey: "booking_id" });

// Review ↔ Booking (1:1)
// Review.belongsTo(Booking, { foreignKey: "booking_id", unique: true });
// Booking.hasOne(Review, { foreignKey: "booking_id" });




export { Salon, Service, SalonOwner, StaffSpecialization, Specialization, Staff, User, Review, Payment, Booking };