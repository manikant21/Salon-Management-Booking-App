import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { registerOwner, loginOwner } from "../../controllers/owner.controller.js";

const router = Router();

router.post("/registerOwner", registerOwner);
router.post("/loginOwner", loginOwner);



export {router};