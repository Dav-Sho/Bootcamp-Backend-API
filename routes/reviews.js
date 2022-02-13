const express = require('express')
const advancedResult = require('../middlewares/advancedResult')
const {getReviews, addReview, updateReview, deleteReview} = require('../controllers/reviews')
const Review = require('../models/Review')
const router = express.Router({mergeParams: true})
const {protect, authorize} = require('../middlewares/auth')

router.route('/').get(advancedResult(Review, {
    path: 'bootcamp',
    select: 'name description'
}),getReviews).post(protect, authorize('user', 'admin'),addReview)
router.route('/:id').patch(protect, authorize('user', 'admin'),updateReview).delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router