import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const SalonOwner = sequelize.define("SalonOwner", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    validate: {
      isEmail: true,
    },
  },
  phoneNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: "SalonOwner",
  tableName: "salon_owner",
  timestamps: true, 
});

export default SalonOwner;
