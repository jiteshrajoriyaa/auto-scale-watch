const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
    try {
        const data = req.headers.token
        const token = data.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_STRING)
        req.userId = decoded.userId
        next()

    } catch (e) {
        console.log('User is unauthenticated, you cannot push to the queue: ', e)
        return res.status(401).json({
            msg: "User is unauthorized to push request"
        })
    }
}

module.exports = authMiddleware