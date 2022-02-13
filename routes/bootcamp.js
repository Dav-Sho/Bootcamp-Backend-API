const express = require('express')
const Bootcamp = require('../models/Bootcamp')
const advancedResult = require('../middlewares/advancedResult')
const {protect, authorize} = require('../middlewares/auth')

const router = express.Router()

const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, bootcampPhoto} = require('../controllers/bootcamp')

// const {getCourses} = require('../controllers/courses')
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router.route('/:id/photo').patch(protect, authorize('publisher', 'admin'), bootcampPhoto)
// router.route('/radius/:zipcode/:distance').get(getBootcampRadius)
router.route('/').get(advancedResult(Bootcamp, 'courses') ,getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp)
router.route('/:id').get(getBootcamp).patch(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp)
// router.route('/:bootcampId/courses').get(getCourses)


module.exports = router