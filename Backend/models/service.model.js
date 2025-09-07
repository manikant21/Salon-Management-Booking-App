import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Service = sequelize.define("Service", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
    },
  service_name: { 
    type: DataTypes.STRING, 
    allowNull: false 
    },
  salon_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
},
  duration: { 
    type: DataTypes.TIME, 
    allowNull: false 
},
  open_time_for_services: { 
    type: DataTypes.TIME, 
    allowNull: true 
},
  close_time_for_services: { 
    type: DataTypes.TIME, 
    allowNull: true 
},
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true }
}, {
  timestamps: true,
  tableName: "services"
});

export default Service;
