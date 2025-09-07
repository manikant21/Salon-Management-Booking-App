import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";

const router = Router();

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);



export {router};