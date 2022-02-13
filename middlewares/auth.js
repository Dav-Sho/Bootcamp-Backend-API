const jwt = require('jsonwebtoken')
const ErrorResponse = require('../utils/ErrorResponse')
const asyncErrorHandler = require('../middlewares/asyncErrorHandler')
const User = require('../models/User')

const protect = asyncErrorHandler(async (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    else if(req.cookies.token) {
        token = req.cookies.token
    }

    if(!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRETE)
        console.log(decoded);

        req.user = await User.findById(decoded.id)

        next()
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }
})

const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} not authorized to access this route`, 401))
        }

        next()
    }
}

module.exports = {
    protect,
    authorize
}