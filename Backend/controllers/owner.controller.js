import bcrypt from "bcrypt";
import SalonOwner from "../models/owner.model.js";
import { JWT_SECRET } from "../config/server.config.js";

function generateAccessToken(id, name) {
    return jwt.sign({userId: id, name: name}, JWT_SECRET)
}

export const registerOwner = async (req, res, next) => {
  try {
    const { name, email, phoneNo, password} = req.body;

   
    if (!name || !email || !phoneNo || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone number, and password are required",
      });
    }

    
    const existingOwner = await SalonOwner.findOne({ where: { email } });
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    
    // const existingPhone = await User.findOne({ where: { phoneNo } });
    // if (existingPhone) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Phone number is already registered",
    //   });
    // }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newOwner = await SalonOwner.create({
      name,
      email,
      phoneNo,
      password: hashedPassword,
    });

   
    return res.status(201).json({
      success: true,
      message: "Owner registered successfully",
      data: {
        id: newOwner.id,
        name: newOwner.name,
        email: newOwner.email,
        phoneNo: newOwner.phoneNo
      },
      token: generateAccessToken(newOwner.id, newOwner.name),
      ownerId: newOwner.id,
      name: newOwner.name
    });
  } catch (err) {
    console.error("Error registering owner:", err);
    next(err); 
  }
};

export const loginOwner = async (req, res, next) => {
    try {
        const { email, password } = req.body;
         const owner = await SalonOwner.findOne({
            where: {
                email:email
            }
        })
        if(!owner) {
            return res.status(404).json({success:false, msg:"Owner not found"});
        }
        const isMatch = await bcrypt.compare(password, owner.password);
         if (!isMatch) {
            return res.status(401).json({ success: false, msg: "Owner not authorized" });
        }
        return res.status(200).json({success: true, msg: "Owner login sucessful", ownerId:owner.id, token: generateAccessToken(owner.id, owner.name), name: owner.name});
    } catch (err) {
        console.error("Error login owner:", err);
        next(err); 
    }
}
