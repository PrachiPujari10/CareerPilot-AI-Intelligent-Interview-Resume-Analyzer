const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const blacklistModel = require("../models/blacklist.model")

async function authUser(req, res, next) {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Please login first." })
        }

        const isBlacklisted = await blacklistModel.findOne({ token })

        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized. Please login first." })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: "Unauthorized. Please login first." })
        }

        req.user = user

        next()

    } catch (err) {
        return res.status(401).json({ message: "Unauthorized. Please login first." })
    }
}

module.exports = { authUser }