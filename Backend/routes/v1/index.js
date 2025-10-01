import { Router } from "express";
import {router as UserRoute} from "./user.route.js";
import {router as OwnerRoute} from "./owner.route.js";
import {router as SalonRoute} from "./salon.route.js";
import {router as StaffRoute} from "./staff.route.js";
import {router as SpecializationRoute} from "./specialization.route.js";
import {router as BookingRoute} from "./booking.route.js";
import {router as PaymentRoute} from "./payment.route.js";
import {router as ReviewRoute} from "./review.route.js";

const router = Router();


router.use("/user", UserRoute);
router.use("/owner", OwnerRoute);
router.use("/salon", SalonRoute);
router.use("/staff", StaffRoute);
router.use("/specializations", SpecializationRoute);
router.use("/booking", BookingRoute);
router.use("/payment", PaymentRoute);
router.use("/review", ReviewRoute);


export {router};