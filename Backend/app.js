import express from "express";
import cookieParser from 'cookie-parser';
import  sequelize  from "./config/db.config.js";
import { PORT } from "./config/server.config.js"
import {router as apiRoute} from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import './services/reminderMailAlert.js'
import './services/checkBookingStatus.js';


const app = express();


app.use(cors({origin: "*"}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cookieParser());

app.use("/api", apiRoute);
app.use(errorHandler);



await sequelize.sync();

app.listen(PORT|| 5000, () => {
        console.log(`Server is up and running at ${PORT}`);
    });
