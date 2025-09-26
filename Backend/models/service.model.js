import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    service_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    salon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    open_time_for_services: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    close_time_for_services: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
  },
  {
    timestamps: true,
    tableName: "services",
    indexes: [
      {
        unique: true,
        fields: ["salon_id", "service_name"], 
      },
    ],
  }
);

export default Service;
