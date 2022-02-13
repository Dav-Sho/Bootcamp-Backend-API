const mongoose = require('mongoose')
const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a review title'],
        maxlength: 100,
        trim: true
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Rating must be btw 1 to 10']
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Prevent user from submitting more than 1 review per bootcamp
ReviewSchema.index({bootcamp: 1, user: 1}, {unique: true})

// Static method to get Avg of rating
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: {$avg: '$rating'}
            }
        }
    ])


    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating 
        })
    } catch (err) {
        console.error(err)
    }
}

// Cal averageCost after save
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.bootcamp)
})

// Cal averageCost be4 remove
ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('Review', ReviewSchema)