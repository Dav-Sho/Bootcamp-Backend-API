const ErrorResponse = require('../utils/ErrorResponse')
const asyncErrorHandler = require('../middlewares/asyncErrorHandler')
const User = require('../models/User')

// route   Get/api/1/auth/users
// desc    Get all Users By Admin
// access  Private
const getUsers = asyncErrorHandler(async(req, res, next) => {
    res.status(200).json(res.advancedResult)
})

// route   Get/api/1/auth/users
// desc    Get single User By Admin
// access  Private
const getUser = asyncErrorHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})

// route   Post/api/1/auth/users
// desc    Create User By Admin
// access  Private
const addUser = asyncErrorHandler(async(req, res, next) => {
    const user = await User.create(req.body)

    res.status(201).json({
        success: true,
        data: user
    })
})

// route   Patch/api/1/auth/users
// desc    Update User By Admin
// access  Private
const updateUser = asyncErrorHandler(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })
})

// route   Delete/api/1/auth/users
// desc    Delete User By Admin
// access  Private
const deleteUser = asyncErrorHandler(async(req, res, next) => {
    const user = await User.findOneAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        data: {}
    })
})

module.exports = {
    getUsers,
    getUser,
    addUser,
    updateUser,
    deleteUser
}