import { Router } from "express";
import {router as UserRoute} from "./user.route.js";

const router = Router();


router.use("/user", UserRoute);


export {router};