import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Salon = sequelize.define("Salon", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
    },
  owner_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
    },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
    },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: false 
    },
  image: { 
    type: DataTypes.STRING, 
    allowNull: false 
    },
  open_time: { 
    type: DataTypes.TIME, 
    allowNull: false 
    },
  close_time: { 
    type: DataTypes.TIME, 
    allowNull: false
    },
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
    },
  location: { 
    type: DataTypes.STRING, 
    allowNull: false 
    }
}, {
  timestamps: true,
  tableName: "salon"
});

export default Salon;
