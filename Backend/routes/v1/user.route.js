import { Router } from "express";
import { authenticateForUser } from "../../middlewares/auth.js";
import { registerUser, loginUser } from "../../controllers/user.controller.js";


const router = Router();

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);



export {router};