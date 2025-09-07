import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Staff = sequelize.define("Staff", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
},
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  email: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  phoneNo: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  salon_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
},
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
}
}, {
  timestamps: true,
  tableName: "staff"
});

export default Staff;
