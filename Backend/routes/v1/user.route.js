import { Router } from "express";
import { authenticateForUser } from "../../middlewares/auth.js";
import { registerUser, loginUser, getAvailableSalon } from "../../controllers/user.controller.js";


const router = Router();

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.get("/allavailablesalon", authenticateForUser, getAvailableSalon);



export {router};