const jwt = require('jsonwebtoken')

async function authToken(req,res,next){
    try{
        const token = req.cookies?.token

        console.log("token",token)
        if(!token){
            return res.status(401).json({
                message : "Access denied. Please login to continue.",
                error : true,
                success : false
            })
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, function(err, decoded) {
            if(err){
                console.log("JWT verification error:", err)
                return res.status(401).json({
                    message : "Invalid or expired token. Please login again.",
                    error : true,
                    success : false
                })
            }

            console.log("decoded",decoded)
            req.userId = decoded?._id
            next()
        });


    }catch(err){
        console.error("Auth middleware error:", err)
        res.status(500).json({
            message : err.message || "Internal server error",
            data : [],
            error : true,
            success : false
        })
    }
}


module.exports = authToken