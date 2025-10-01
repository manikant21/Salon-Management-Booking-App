import { Router } from "express";
import { authenticateForOwner, authenticateForUser } from '../../middlewares/auth.js';
import { addSpecialization, getSpecialization, getSpecializationsBySalon } from "../../controllers/specialization.controller.js";

const router = Router();

router.post("/add", authenticateForOwner, addSpecialization);
router.get("/:salonId", authenticateForOwner, getSpecialization)
router.get("/get/:salonId", authenticateForUser, getSpecializationsBySalon);

export {router};