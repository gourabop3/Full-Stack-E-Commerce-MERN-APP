const userModel = require("../../models/userModel")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Request password reset
async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                message: "Please provide email address",
                error: true,
                success: false,
            })
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address",
                error: true,
                success: false,
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            // Don't reveal if user exists for security
            return res.status(200).json({
                message: "If an account with that email exists, we've sent password reset instructions.",
                success: true,
                error: false,
            })
        }

        // Generate reset token
        const resetTokenData = {
            userId: user._id,
            email: user.email,
            purpose: 'password-reset'
        }

        const resetToken = jwt.sign(resetTokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' })

        // In a real application, you would send this token via email
        // For now, we'll return it in the response (remove this in production)
        console.log("Password reset token:", resetToken)

        res.status(200).json({
            message: "If an account with that email exists, we've sent password reset instructions.",
            resetToken: resetToken, // Remove this line in production
            success: true,
            error: false,
        })

    } catch (err) {
        console.error("Forgot password error:", err)
        res.status(500).json({
            message: err.message || "Internal server error",
            error: true,
            success: false,
        })
    }
}

// Reset password with token
async function resetPasswordController(req, res) {
    try {
        const { token, newPassword, confirmPassword } = req.body

        if (!token) {
            return res.status(400).json({
                message: "Reset token is required",
                error: true,
                success: false,
            })
        }

        if (!newPassword) {
            return res.status(400).json({
                message: "Please provide new password",
                error: true,
                success: false,
            })
        }

        if (!confirmPassword) {
            return res.status(400).json({
                message: "Please confirm your new password",
                error: true,
                success: false,
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                error: true,
                success: false,
            })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
                error: true,
                success: false,
            })
        }

        // Verify reset token
        let decoded
        try {
            decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
        } catch (err) {
            return res.status(400).json({
                message: "Invalid or expired reset token",
                error: true,
                success: false,
            })
        }

        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({
                message: "Invalid reset token",
                error: true,
                success: false,
            })
        }

        const user = await userModel.findById(decoded.userId)

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            })
        }

        // Hash new password
        const salt = bcrypt.genSaltSync(10)
        const hashPassword = bcrypt.hashSync(newPassword, salt)

        // Update user password
        await userModel.findByIdAndUpdate(user._id, { password: hashPassword })

        res.status(200).json({
            message: "Password reset successfully. Please login with your new password.",
            success: true,
            error: false,
        })

    } catch (err) {
        console.error("Reset password error:", err)
        res.status(500).json({
            message: err.message || "Internal server error",
            error: true,
            success: false,
        })
    }
}

module.exports = {
    forgotPasswordController,
    resetPasswordController
}