const express = require('express')
const {getUsers, getUser, addUser, updateUser, deleteUser} = require('../controllers/user')
const advancedResult = require('../middlewares/advancedResult')
const User = require('../models/User')
const {protect, authorize} = require('../middlewares/auth')
const router = express.Router({mergeParams: true})

router.use(protect)
router.use(authorize('admin'))

router.route('/').get(advancedResult(User),getUsers).post(addUser)
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUser)

module.exports = router