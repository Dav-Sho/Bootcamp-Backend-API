const path = require('path')
const asyncErrorHandler = require('../middlewares/asyncErrorHandler')
const ErrorResponse = require('../utils/ErrorResponse')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// route   Get/api/1/bootcamps
// desc    Get all bootcamps
// access  Public
const getBootcamps = asyncErrorHandler(async(req, res, next) => {

    // let query;

    // // copy req.query
    // const reqQuery = { ...req.query}

    // const removeFields = ['search', 'sort', 'limit', 'page']

    // removeFields.forEach(param => delete reqQuery[param])

    // // Create query String
    // let queryStr = JSON.stringify(reqQuery)

    // // Create Operators
    // queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // // Finding resources
    // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

    // if(req.query.search) {
    //     const fields = req.query.search.split(',').join(' ')
    //     // query = query.select(fields)
    //     query = query.select(fields)
    // }

    // if(req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ')
    //     query = query.sort(sortBy)
    // }else{
    //     query = query.sort('-createdAt')
    // }

    // const page = parseInt(req.query.page, 10) || 1;
    // const limit = parseInt(req.query.limit, 10) || 10;
    // const startIndex = (page - 1) * limit
    // const endIndex = page * limit
    // const total = await Bootcamp.countDocuments()

    // query = query.skip(startIndex).limit(limit)

    // // Executing query
    //  const bootcamps = await query

    //  const pagination = {}

    //  if(endIndex < total) {
    //      pagination.next = {
    //          page: page + 1,
    //          limit
    //      }
    //  }

    //  if(startIndex > 0) {
    //      pagination.prev = {
    //          page: page -1,
    //          limit
    //      }
    //  }

     res.status(200).json(res.advancedResult)
 
})

// route   Get/api/1/bootcamp
// desc    Get single bootcamp
// access  Public
const getBootcamp = asyncErrorHandler( async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

     if(!bootcamp){
          return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404))
      }
      res.status(200).json({success: true, bootcamp})
})

// route   Post/api/1/bootcamp
// desc    Create bootcamp
// access  Private
const createBootcamp = asyncErrorHandler(async(req, res, next) => {
    // Add user to the bootcamp
    req.body.user = req.user.id

    const publisherBootcamp = await Bootcamp.findOne({user: req.user.id})

    if(publisherBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with the ID ${req.user.id} has already published a bootcamp`))
    }

    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({success: true, data: bootcamp})
})

// route   Patch/api/1/bootcamp
// desc    Update bootcamp
// access  Private
const updateBootcamp = asyncErrorHandler(async(req, res, next) => {
        let bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404))
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`user ${req.params.id} is not authorizecan to update this bootcamp`, 404))
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({success: true, bootcamp})

})

// route   Delete/api/1/bootcamp
// desc    Delete bootcamp
// access  Private
const deleteBootcamp = asyncErrorHandler(async(req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404))
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`The user ${req.params.id} is not authorize to delete this bootcamp`))
        }

        bootcamp.remove()

        res.status(200).json({success: true, msg: `Bootcamp with the id ${req.params.id} deleted`})
 
})

// // route   Get/api/1/bootcamp/radius/:zipcode/:distance
// // desc    Get bootcamp within the radius
// // access  Private
// const getBootcampRadius = asyncErrorHandler(async(req, res, next) => {
//         const {zipcode, distance} = req.params

//         const loc = await geocoder.geocode(zipcode)
//         const lat = loc[0].latitude
//         const lng = loc[0].longitude

//         // cal radius using radian
//         // divide distance by radius of the earth
//         // Eath radius = 3,963 mi /6, 378km
//         const radius = distance / 3963

//         const bootcamps = await Bootcamp.find({location: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}})

//         res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})
 
// })

// route   Put/api/1/bootcamp
// desc    Upload bootcamp photo
// access  Private
const bootcampPhoto = asyncErrorHandler(async(req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with the id of ${req.params.id}`, 404))
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user ${req.params.id} is not authorize to delete this bootcamp`))
    }

    if(!req.files) {
        return next(new ErrorResponse('Please upload a file', 400)) 
    }

    const file = req.files.file

    // check if user upload photo
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400))
    }

    // Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }

    // Create custom file nmae
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.error(err)
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo : file.name})

        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})

module.exports = {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    bootcampPhoto
   
}