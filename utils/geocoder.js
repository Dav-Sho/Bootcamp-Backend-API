const NodeGeocoder = require('node-geocoder')

const options = {
    provider: 'mapquest',
    htppAdapter: 'https',
    apiKey: ' ZG6obxFAUhbXGsbnD9w8ve06bZl6iAwS',
    formatter: null
}

// Testing my env var on geocoder api key
// console.log({options})

const geocoder = NodeGeocoder(options)

module.exports = geocoder;