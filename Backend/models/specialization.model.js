import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Specialization = sequelize.define("Specialization", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
},
  name: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
}
}, {
  timestamps: true,
  tableName: "specialization"
});

export default Specialization;
