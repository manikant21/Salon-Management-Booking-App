import {Router} from 'express';
import {checkCredential, getAllUser, getAllOwner, getAllSalon, getAllBooking, getAllStaff, getAllReview, deleteOwner, deleteUser, deleteSalon, deleteReview, cancelBooking} from "../../controllers/admin.controller.js";
import { authenticateForAdmin } from '../../middlewares/auth.js';



const router = Router();

router.post("/login", checkCredential);

router.get("/allusers", authenticateForAdmin, getAllUser);
router.get("/allowners", authenticateForAdmin, getAllOwner);
router.get("/allsalons", authenticateForAdmin, getAllSalon);
router.get("/allbookings", authenticateForAdmin, getAllBooking);
router.get("/allstaffs", authenticateForAdmin, getAllStaff);
router.get("/allreview", authenticateForAdmin, getAllReview);
router.delete("/user/:id", authenticateForAdmin, deleteUser);
router.delete("/owner/:id", authenticateForAdmin, deleteOwner);
router.delete("/salon/:id", authenticateForAdmin, deleteSalon);
router.delete("/review/:id", authenticateForAdmin, deleteReview);
router.patch("/booking/:id", authenticateForAdmin, cancelBooking);



export {router};