const crypto = require('crypto')
const ErrorResponse = require('../utils/ErrorResponse')
const asyncErrorHandler = require('../middlewares/asyncErrorHandler')
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')

// route   Post/api/1/auth/register
// desc    Register User
// access  Public
const register = asyncErrorHandler(async(req, res, next) => {
    const {name, email, password, role} = req.body
    let user = await User.findOne({email})

    // Check if user already exist
    if(user) {
        return next(new ErrorResponse(`User with the ${email} already exist`))
    }

    user = await User.create({
        name,
        email,
        password,
        role
    })

    sendTokenResponse(user, 200, res)
})

// route   Post/api/1/auth/login
// desc    Login User
// access  Public
const login = asyncErrorHandler (async (req, res, next) => {
    const {email, password} = req.body

    if(!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400))
    }

    // check if user exist in database
    const user = await User.findOne({email}).select('+password')

    if(!user) {
        return next(new ErrorResponse('Invalid Credentials', 400))
    }

    const matchPassword = await user.matchPassword(password)

    if(!matchPassword) {
        return next(new ErrorResponse('Invalid Credentials', 400))
    }

    sendTokenResponse(user, 200, res)
})

// route   Get/api/1/auth/logout
// desc    Logout user
// access  Private
const logout = asyncErrorHandler(async(req, res, next) => {
    res.cookie('token', 'null', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        data:{}
    })
})

// route   Post/api/1/auth/me
// desc    Get login user
// access  Private
const getMe = asyncErrorHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})

// route   Post/api/1/auth/updatedetails
// desc    Update user details
// access  Private
const updateDetails = asyncErrorHandler(async(req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        password: req.body.password
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })
})

// route   Post/api/1/auth/updatepassword
// desc    Update user password
// access  Private
const updatePassword = asyncErrorHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if(!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 400))
    }

    user.password = req.body.newPassword

    await user.save()

    sendTokenResponse(user, 200, res)
})

// route Post/api/auth/forgot
// desc  Forgot password
// access Public
const forgotPassword = asyncErrorHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email})

    if(!user) {
        return next(new ErrorResponse(`There is no user with ${req.body.email}`, 404))
    }

    const resetToken = user.getRestPasswordToken()

    console.log(resetToken);

    await user.save({validateBeforeSave: false})

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. please make a put request to: \n\n ${resetUrl} `

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({
            success: true,
            data: 'Email sent'
        })
    } catch (err) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        await user.save({validateBeforeSave: false})
        return next(new ErrorResponse('Email could not be sent', 500))
    }

    res.status(200).json({
        success: true,
        data: user
    })
})

// route Patch/api/auth/resetpassword/:ressettoken
// desc  Reset password
// access Public
const resetPassword = asyncErrorHandler(async(req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: {$gt: Date.now()}
    })

    if(!user) {
        return next(new ErrorResponse('Invalid token'), 400)
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    sendTokenResponse(user, 200, res)
})

// Set Cookie Token
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getJwtToken()

    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res.status(statusCode).cookie('token', token, options).json({success: true, token})
}

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    logout
}