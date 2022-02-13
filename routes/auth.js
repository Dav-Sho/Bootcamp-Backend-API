const express = require('express')
const {register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout} = require('../controllers/auth')
const {protect} = require('../middlewares/auth')

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/me').get(protect, getMe)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:resettoken').patch(resetPassword)
router.route('/updatedatails').patch(protect,updateDetails)
router.route('/updatepassword').patch(protect,updatePassword)

module.exports = router