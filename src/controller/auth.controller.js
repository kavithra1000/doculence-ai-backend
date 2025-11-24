import User from "../model/user.model.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/utils.js";


export const Signup = async(req,res) => {

    try{

        const {fullName, email, password} = req.body;

        console.log(fullName);
        

        //Password validation
        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"})
        }

        //Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({message: "User already exists"});
        }

        //Field validation
        if (!fullName || !email || !password ) {
            return res.status(400).json({message: "All fields are required"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User ({
            fullName,
            email,
            password: hashedPassword,
        })

        if (newUser) {

            generateToken(newUser._id, res);

            await newUser.save();
            return res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email
                },
            });
            
        } else {
            return res.status(400).json({
                message: "User not created."
            });
        }

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            message: "Internal server error"
        })
    }


}

export const Login = async (req, res) => { 

    try {
        const {email, password} = req.body;

        console.log(email, password)

        // Validate required fields
        if(!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user =   await User.findOne({email});

        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if(!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        return res.status(200).json({
        message: "Login successful",
        user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
            },
        })

    } catch(error){
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

export const Logout = async (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ 
        message: "Logged out successfully" 
    });
}

export const CheckAuth = (req, res) => {
    try{
        if(!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        return res.status(200).json(req.user);
    } catch (error) {
        console.error("Error during authentication check:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
