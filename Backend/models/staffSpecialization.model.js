import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const StaffSpecialization = sequelize.define("StaffSpecialization", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
},
  staff_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
},
  specialization_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
}
}, {
  timestamps: true,
  tableName: "staff_specialization"
});

export default StaffSpecialization;
