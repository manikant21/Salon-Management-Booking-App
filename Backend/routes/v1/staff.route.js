import {Router} from 'express';
import { authenticateForOwner, authenticateForUser } from '../../middlewares/auth.js';
import {addStaff, updateStaff, getStaffDetail, deleteStaff, getStaffDetailForEdit, getStaffById, assignSpecializations, getStaffByService} from "../../controllers/staff.controller.js";

const router = Router();

router.post("/add", authenticateForOwner, addStaff);
router.put("/:staffId", authenticateForOwner, updateStaff);
router.get("/:salonId/staff", authenticateForOwner, getStaffDetail);
router.delete("/:staffId", authenticateForOwner, deleteStaff);
router.get("/:staffId", authenticateForOwner, getStaffDetailForEdit);
router.get("/get/:staffId", authenticateForOwner, getStaffById);
router.post("/assignSpecializations", authenticateForOwner, assignSpecializations);
router.get("/byService/:serviceId", authenticateForUser, getStaffByService);



export {router};