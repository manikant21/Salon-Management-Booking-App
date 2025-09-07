import bcrypt from "bcrypt";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/server.config.js";

function generateAccessToken(id, name) {
    return jwt.sign({userId: id, name: name}, JWT_SECRET)
}

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, phoneNo, password, address, age } = req.body;

   
    if (!username || !email || !phoneNo || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, phone number, and password are required",
      });
    }

    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
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

   
    const newUser = await User.create({
      username,
      email,
      phoneNo,
      password: hashedPassword,
      address: address || null,
      age: age || null,
    });

   
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phoneNo: newUser.phoneNo,
        address: newUser.address,
        age: newUser.age,
        status: newUser.status,
      },
      token: generateAccessToken(newUser.id, newUser.username),
      userId: newUser.id,
      name: newUser.username
    });
  } catch (err) {
    console.error("Error registering user:", err);
    next(err); 
  }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
         const user = await User.findOne({
            where: {
                email:email
            }
        })
        if(!user) {
            return res.status(404).json({success:false, msg:"User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
            return res.status(401).json({ success: false, msg: "User not authorized" });
        }
        return res.status(200).json({success: true, msg: "User login sucessful", userId:user.id, token: generateAccessToken(user.id, user.name), name: user.username});
    } catch (err) {
        console.error("Error login user:", err);
        next(err); 
    }
}
