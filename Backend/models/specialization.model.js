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
},
  salon_id: {   
    type: DataTypes.INTEGER,
    allowNull: false,
  },
   is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
}, {
  timestamps: true,
  tableName: "specialization",
  uniqueKeys: {
  unique_specialization_per_salon: {
    fields: ["salon_id", "name"]
  }
}

});

export default Specialization;
