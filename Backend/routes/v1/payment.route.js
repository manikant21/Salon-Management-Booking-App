import { Router } from "express";
import { authenticateForUser } from "../../middlewares/auth.js";
import {initiatePayment, verifyPayment, sendConfirmationMail} from "../../controllers/payment.controller.js";

const router = Router();
router.post("/initiate", authenticateForUser, initiatePayment);
router.post("/verify", authenticateForUser, verifyPayment);
router.post("/sendConfirmation", authenticateForUser, sendConfirmationMail)

export {router};