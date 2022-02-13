const ErrorResponse = require('../utils/ErrorResponse')
const asyncErrorHandler = require('../middlewares/asyncErrorHandler')
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');


// route   Get/api/1/courses
// route   Get/api/1/bootcamps/:bootcampId/courses
// desc    Get all courses & Get course by specific bootcamp
// access  Public
const getCourses = asyncErrorHandler(async (req, res, next) => {
    // find all courses by specific bootcamp

    if(req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId})

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    }else{
        res.status(200).json(res.advancedResult)
    }

})

// route   Get/api/1/course
// desc    Get single course
// access  Public

const getCourse = asyncErrorHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if(!course) {
        return next(new ErrorResponse(`No course with the id ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        data: course
    })
})

// route   Post/api/1/course
// desc    Create course
// access  Private

const addCourse = asyncErrorHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId

    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404))
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The User ${req.params.bootcampId} is not authorize to create a course`))
    }

    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})

// route   Patch/api/1/course
// desc    Update course
// access  Private
const updateCourse =  asyncErrorHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if(!course) {
        return next(new ErrorResponse(`No course with the id ${req.params.id}`))
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorize to update this course`))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true, data: course
    })
})

// route   Delete/api/1/course
// desc    Delete course
// access  Private
const deleteCourse = asyncErrorHandler(async(req, res, next) => {
    let course = await Course.findById(req.params.id)

    if(!course) {
        return next(new ErrorResponse(`No course with the id ${req.params.id}`))
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(`User ${req.params.id} is not authorize to delete this course`)
    }

    await course.remove()

    res.status(200).json({success: true, msg: `Course deleted with the id ${req.params.id}`})
})
module.exports = {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
}