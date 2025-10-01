import { Cashfree } from "cashfree-pg";
// import dotenv from "dotenv";
// dotenv.config();
import { CASHFREE_APP_ID, CASHFREE_SECRET_KEY } from "./server.config.js";

const cashfreePG = new Cashfree({
    clientId: process.env.CASHFREE_APP_ID,
    clientSecret: process.env.CASHFREE_SECRET_KEY,
    environment: "sandbox" // or "production" for live
});



export default cashfreePG;

