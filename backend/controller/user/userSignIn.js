const bcrypt = require('bcryptjs')
const userModel = require('../../models/userModel')
const jwt = require('jsonwebtoken');

async function userSignInController(req,res){
    try{
        const { email , password} = req.body

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

        const user = await userModel.findOne({email})

       if(!user){
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            })
       }

       const checkPassword = await bcrypt.compare(password,user.password)

       console.log("checkPassword",checkPassword)

       if(checkPassword){
        const tokenData = {
            _id : user._id,
            email : user.email,
        }
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 8 });

        const tokenOption = {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production', // Only secure in production
            sameSite: 'strict'
        }

        res.cookie("token",token,tokenOption).status(200).json({
            message : "Login successfully",
            data : token,
            success : true,
            error : false
        })

       }else{
         return res.status(401).json({
            message: "Please check Password",
            error: true,
            success: false,
         })
       }

    }catch(err){
        console.error("Login error:", err)
        res.status(500).json({
            message : err.message || "Internal server error",
            error : true,
            success : false,
        })
    }

}

module.exports = userSignInController