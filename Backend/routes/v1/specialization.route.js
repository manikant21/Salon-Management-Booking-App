import { Router } from "express";
import { authenticateForOwner } from '../../middlewares/auth.js';
import { addSpecialization, getSpecialization } from "../../controllers/specialization.controller.js";

const router = Router();

router.post("/add", authenticateForOwner, addSpecialization);
router.get("/:salonId", authenticateForOwner, getSpecialization)

export {router};