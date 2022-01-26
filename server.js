const express = require('express')
const color = require('colors')
const dotenv = require('dotenv')

dotenv.config({path: './config/config.env'})

const app = express()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port:${PORT}`)
})