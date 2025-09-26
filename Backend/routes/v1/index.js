import { Router } from "express";
import {router as UserRoute} from "./user.route.js";
import {router as OwnerRoute} from "./owner.route.js";
import {router as SalonRoute} from "./salon.route.js";
import {router as StaffRoute} from "./staff.route.js";
import {router as SpecializationRoute} from "./specialization.route.js";

const router = Router();


router.use("/user", UserRoute);
router.use("/owner", OwnerRoute);
router.use("/salon", SalonRoute);
router.use("/staff", StaffRoute);
router.use("/specializations", SpecializationRoute);


export {router};