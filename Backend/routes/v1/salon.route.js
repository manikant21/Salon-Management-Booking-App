import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { registerSalon } from "../../controllers/salon.controller.js";

const router = Router();

router.post("/salonRegister", authenticate, registerSalon);

export {router};

