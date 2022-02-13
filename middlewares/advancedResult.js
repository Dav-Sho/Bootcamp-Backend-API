const advancedResult = (model, populate) => async(req, res, next) => {
    let query;

    // copy req.query
    const reqQuery = { ...req.query}

    const removeFields = ['search', 'sort', 'limit', 'page']

    removeFields.forEach(param => delete reqQuery[param])

    // Create query String
    let queryStr = JSON.stringify(reqQuery)

    // Create Operators
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // Finding resources
    query = model.find(JSON.parse(queryStr))
    if(req.query.search) {
        const fields = req.query.search.split(',').join(' ')
        // query = query.select(fields)
        query = query.select(fields)
    }

    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }else{
        query = query.sort('-createdAt')
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    if(populate) {
        query = query.populate(populate)
    }

    // Executing query
     const results = await query

     const pagination = {}

     if(endIndex < total) {
         pagination.next = {
             page: page + 1,
             limit
         }
     }

     if(startIndex > 0) {
         pagination.prev = {
             page: page -1,
             limit
         }
     }

     res.advancedResult = {
         success: true,
         count: results.length,
         pagination,
         data: results
     }

     next()
}

module.exports = advancedResult