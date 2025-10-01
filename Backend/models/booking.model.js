import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Booking = sequelize.define("Booking", {
    id:
    {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    booking_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    booking_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, // minutes
    modifiedByAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    adminRemarks: {
        type: DataTypes.STRING
    },
    booking_status: {
        type: DataTypes.ENUM("pending", "confirmed", "completed", "canceled"),
        defaultValue: "pending",
    },
    payment_status: {
        type: DataTypes.ENUM("unpaid", "paid", "refunded"),
        defaultValue: "unpaid",
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    canceled_at: {
        type: DataTypes.DATE
    },
    completed_at: {
        type: DataTypes.DATE
    },
},
    {
        modelName: "Booking",
        tableName: "booking",
        timestamps: true,
    }
);

export default Booking;
