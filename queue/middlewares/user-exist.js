const User = require("../db")

async function userExist(req, res, next) {
    try {
        const userId = req.userId
        const user = await User.findById(userId)

        if (!user) {
            return res.status(401).json({
                msg: "User is unauthrized"
            })
        }
        next()

    }catch(e){
        console.error("Error in user-Exist middleware: ", e)
    }
}

module.exports = userExist