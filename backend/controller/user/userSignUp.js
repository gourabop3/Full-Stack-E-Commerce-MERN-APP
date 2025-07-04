const userModel = require("../../models/userModel")
const bcrypt = require('bcryptjs');


async function userSignUpController(req,res){
    try{
        const { email, password, name} = req.body

        if(!email){
            return res.status(400).json({
                message: "Please provide email",
                error: true,
                success: false,
            })
        }
        if(!password){
            return res.status(400).json({
                message: "Please provide password",
                error: true,
                success: false,
            })
        }
        if(!name){
            return res.status(400).json({
                message: "Please provide name",
                error: true,
                success: false,
            })
        }

        // Password validation
        if(password.length < 6){
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
                error: true,
                success: false,
            })
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                message: "Please provide a valid email address",
                error: true,
                success: false,
            })
        }

        const user = await userModel.findOne({email})

        console.log("user",user)

        if(user){
            return res.status(409).json({
                message: "User already exists with this email",
                error: true,
                success: false,
            })
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(password, salt);

        if(!hashPassword){
            return res.status(500).json({
                message: "Error hashing password",
                error: true,
                success: false,
            })
        }

        const payload = {
            ...req.body,
            role : "GENERAL",
            password : hashPassword
        }

        const userData = new userModel(payload)
        const saveUser = await userData.save()

        res.status(201).json({
            data : saveUser,
            success : true,
            error : false,
            message : "User created Successfully!"
        })


    }catch(err){
        console.error("Signup error:", err)
        res.status(500).json({
            message : err.message || "Internal server error",
            error : true,
            success : false,
        })
    }
}

module.exports = userSignUpController