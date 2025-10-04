import { Router } from "express";
import { authenticateForOwner, authenticateForUser } from "../../middlewares/auth.js";
import { registerSalon , getMyAllSalon, getSalonDetails, addService, getServiceDetails, deleteService, getServiceDetailForEdit, updatedData, deleteSalon, getSalonDetailForEdit, updateSalonData, getSalonById, getServicesBySalon, searchByServiceName} from "../../controllers/salon.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.post("/salonRegister", authenticateForOwner, upload.single("image"), registerSalon);
router.get("/myallsalon", authenticateForOwner, getMyAllSalon);
router.get("/:salonId", authenticateForOwner, getSalonDetails);
router.post("/addservice", authenticateForOwner, addService);
router.get("/:salonId/services", authenticateForOwner, getServiceDetails);
router.delete("/service/:serviceId", authenticateForOwner, deleteService);
router.get("/service/:serviceId", authenticateForOwner, getServiceDetailForEdit);
router.put("/service/:serviceId", authenticateForOwner, updatedData);
router.delete("/delete/:salonId", authenticateForOwner, deleteSalon);
router.get("/edit/:salonId", authenticateForOwner, getSalonDetailForEdit);
router.put("/update/:salonId", authenticateForOwner, updateSalonData);
router.get("/get/:salonId", authenticateForUser, getSalonById);
router.get("/get/services/:salonId", authenticateForUser, getServicesBySalon);
router.get("/find/services/search", authenticateForUser, searchByServiceName);

export {router};

