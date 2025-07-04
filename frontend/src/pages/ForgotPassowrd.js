import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import loginIcons from '../assest/signin.gif'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [resetToken, setResetToken] = useState('')
    const [showResetForm, setShowResetForm] = useState(false)
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(SummaryApi.forgot_password.url, {
                method: SummaryApi.forgot_password.method,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
                // In development, show the reset form with the token
                if (data.resetToken) {
                    setResetToken(data.resetToken)
                    setShowResetForm(true)
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async (e) => {
        e.preventDefault()
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long")
            return
        }

        setLoading(true)

        try {
            const response = await fetch(SummaryApi.reset_password.url, {
                method: SummaryApi.reset_password.method,
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: passwordData.newPassword,
                    confirmPassword: passwordData.confirmPassword
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
                // Reset form
                setShowResetForm(false)
                setResetToken('')
                setEmail('')
                setPasswordData({ newPassword: '', confirmPassword: '' })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <section id='forgot-password'>
            <div className='mx-auto container p-4'>
                <div className='bg-white p-5 w-full max-w-sm mx-auto'>
                    <div className='w-20 h-20 mx-auto'>
                        <img src={loginIcons} alt='forgot password icon'/>
                    </div>

                    {!showResetForm ? (
                        <>
                            <h2 className='text-2xl font-semibold text-center mt-4 mb-6'>Forgot Password</h2>
                            <p className='text-gray-600 text-center mb-6'>
                                Enter your email address and we'll send you instructions to reset your password.
                            </p>
                            
                            <form className='pt-6 flex flex-col gap-2' onSubmit={handleEmailSubmit}>
                                <div className='grid'>
                                    <label>Email : </label>
                                    <div className='bg-slate-100 p-2'>
                                        <input 
                                            type='email' 
                                            placeholder='Enter your email' 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className='w-full h-full outline-none bg-transparent'
                                        />
                                    </div>
                                </div>

                                <button 
                                    type='submit'
                                    disabled={loading}
                                    className='bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 w-full max-w-[200px] rounded-full hover:scale-110 transition-all mx-auto block mt-6'
                                >
                                    {loading ? 'Sending...' : 'Send Reset Instructions'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className='text-2xl font-semibold text-center mt-4 mb-6'>Reset Password</h2>
                            <p className='text-gray-600 text-center mb-6'>
                                Enter your new password below.
                            </p>
                            
                            <form className='pt-6 flex flex-col gap-2' onSubmit={handlePasswordReset}>
                                <div className='grid'>
                                    <label>New Password : </label>
                                    <div className='bg-slate-100 p-2'>
                                        <input 
                                            type='password' 
                                            placeholder='Enter new password' 
                                            name='newPassword'
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className='w-full h-full outline-none bg-transparent'
                                        />
                                    </div>
                                </div>

                                <div className='grid'>
                                    <label>Confirm New Password : </label>
                                    <div className='bg-slate-100 p-2'>
                                        <input 
                                            type='password' 
                                            placeholder='Confirm new password' 
                                            name='confirmPassword'
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className='w-full h-full outline-none bg-transparent'
                                        />
                                    </div>
                                </div>

                                <button 
                                    type='submit'
                                    disabled={loading}
                                    className='bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6'
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}

                    <div className='text-center mt-6'>
                        <Link to={"/login"} className='text-red-600 hover:text-red-700 hover:underline'>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ForgotPassword