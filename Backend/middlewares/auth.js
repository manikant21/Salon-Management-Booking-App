import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { JWT_SECRET } from "../config/server.config.js";


export const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log(token);
        const user = jwt.verify(token, JWT_SECRET);
        console.log(user.userId);
        const users = await User.findByPk(user.userId);
        if(!users) {
            return res.status(401).json({success: false});
        }
        req.user= users;  
        next();


    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: "Something went wrong"});
    }
}