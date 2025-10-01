import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Payment = sequelize.define("Payment", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
    },
     order_id: {   // cashfree order id
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    payment_session_id: {   // cashfree session id
        type: DataTypes.STRING
    },
    paid_at: {
        type: DataTypes.DATE
    },
    confirmation_mail_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    modelName: "Payment",
    tableName: "payment",
    timestamps: true,
});


export default Payment;
