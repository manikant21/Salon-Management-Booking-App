import { Router } from "express";
import { authenticateForUser } from "../../middlewares/auth.js";
import { createReview, getReviewData } from "../../controllers/review.controller.js";


const router = Router();

router.post("/add", authenticateForUser, createReview); 
router.get("/:bookingId", authenticateForUser, getReviewData);  

export {router};