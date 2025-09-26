import Salon from "./salon.model.js";
import Staff from "./staff.model.js";
import Specialization from "./specialization.model.js";
import Service from "./service.model.js";
import StaffSpecialization from "./staffSpecialization.model.js";
import User from "./user.model.js";
import SalonOwner from "./owner.model.js";


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

export {Salon, Service, SalonOwner, StaffSpecialization, Specialization, Staff, User};