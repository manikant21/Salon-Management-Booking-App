import {Salon} from "../models/salon.model.js";


export const registerSalon = async (req, res, next) => {
    try {
        
    } catch (err) {
        console.error("Error in registering salon:", err);
        next(err); 
    }
}