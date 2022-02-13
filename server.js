const path = require('path')
const express = require('express')
const color = require('colors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieparser = require('cookie-parser')
const fileupload = require('express-fileupload')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
// const Logger = require('./middlewares/Logger')

const connectDB = require('./database/connect')
const Bootcamp = require('./routes/bootcamp')
const Course = require('./routes/courses')
const Auth = require('./routes/auth')
const User = require('.//routes/user')
const Review = require('./routes/reviews')
const errorHandler = require('./middlewares/error')

// Load env var
dotenv.config({path: './config/config.env'})

// Connect DB
connectDB()

const app = express()

// cookie-parser
app.use(cookieparser())

// middleware
app.use(express.json())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// file uploading
app.use(fileupload())

// Sanitize data
app.use(mongoSanitize())

// Set security header
app.use(helmet())

// Prevent xss attack
app.use(xss())

// Enable cors
app.use(cors())

// Rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 100,
    max: 100
})

app.use(limiter)

app.use(hpp())

// static folder
app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use('/api/v1/bootcamps', Bootcamp)
app.use('/api/v1/courses', Course)
app.use('/api/v1/auth', Auth)
app.use('/api/v1/users', User)
app.use('/api/v1/reviews', Review)
app.use(errorHandler)


const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port:${PORT}`.yellow)
})

process.on('unhandledRejection', (err, promise) => {
    console.log({Error: err.message});
    server.close(() => process.exit(1))
})