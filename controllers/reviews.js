const ErrorResponse = require('../utils/ErrorResponse')
const asyncErrorHandler = require('../middlewares/asyncErrorHandler')
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// route   Get/api/1/reviews
// route   Get/api/1/bootcamps/:bootcampId/reviews
// desc    Get all reviews & Get reviews by a specific bootcamp
// access  Public
const getReviews = asyncErrorHandler(async(req, res, next) => {
    if(req.params.bootcampId) {
        const reviews = await Review.findOne({bootcamp: req.params.bootcampId})

        res.status(200).json({
            success: true,
            data: reviews
        })
    }else{
        res.status(200).json(res.advancedResult)
    }
}) 

// route   Post/api/1/reviews
// desc    Create a review
// access  Private
const addReview = asyncErrorHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`))
    }

    const review = await Review.create(req.body)

    console.log(review);

    res.status(201).json({
        success: true,
        data: review
    })
})

// route   Update/api/1/reviews
// desc    Update Review
// access  Private
const updateReview = asyncErrorHandler(async(req, res, next) => {
    let review = await Review.findById(req.params.id)

    if(!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 400))
    }

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with the role ${req.user.role} can not update this review`, 401))
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: review
    })
})

const deleteReview = asyncErrorHandler(async(req, res, next) => {
    let review = await Review.findById(req.params.id)

    if(!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 400))
    }

    // check if the user owns this review
    if(review.user.toString() !== req.user.id && review.user.role !== 'admin'){
        return next(new ErrorResponse(`User with the role ${req.user.role} can not update this review`, 401))
    }

    review = await Review.findOneAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        data: {}
    })
})

module.exports = {
    getReviews,
    addReview,
    updateReview,
    deleteReview
}