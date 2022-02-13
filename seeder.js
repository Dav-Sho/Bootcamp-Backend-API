const fs =require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const colors = require('colors')
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

dotenv.config({path: './config/config.env'})

mongoose.connect(process.env.MONGO_URL)

// Read bootcamp
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))

const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))

const user = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))

const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))



const importData = async() => {
   try {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await User.create(user)
        await Review.create(reviews)
        console.log('Data Imported...'.green.inverse);
        process.exit(1)
   } catch (err) {
       console.error(err.message)
   }
}

const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data Destoryed....'.red.inverse);
        process.exit(1)
    } catch (err) {
        console.error(err.message)
    }
}

if(process.argv[2] === 'i') {
    importData()
}else if(process.argv[2] === 'd'){
    deleteData()
}