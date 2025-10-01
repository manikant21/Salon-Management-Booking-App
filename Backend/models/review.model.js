import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Review = sequelize.define("Review", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    salon_rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    staff_rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reviewForSalon: {
        type: DataTypes.TEXT
    },
    reviewForStaff: {
        type: DataTypes.TEXT
    },
}, {
    modelName: "Review",
    tableName: "review",
    timestamps: true,
});

export default Review