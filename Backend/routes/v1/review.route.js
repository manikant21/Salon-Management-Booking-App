import { Router } from "express";
import { authenticateForUser } from "../../middlewares/auth.js";
import { createReview } from "../../controllers/review.controller.js";


const router = Router();

router.post("/", authenticateForUser, createReview);   

export {router};