const userModel = require("../models/user.model")
const blacklistModel = require("../models/blacklist.model")

/**
 * @description Controller to register a new user.
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required." })
        }

        const isUserAlready = await userModel.findOne({ email })

        if (isUserAlready) {
            return res.status(409).json({ message: "User with this email already exists." })
        }

        const hashedPassword = await userModel.hashPassword(password)

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        })

        const token = user.generateAuthToken()

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (err) {
        res.status(500).json({ message: "Something went wrong.", error: err.message })
    }
}

/**
 * @description Controller to login an existing user.
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." })
        }

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." })
        }

        const isPasswordCorrect = await user.comparePassword(password)

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password." })
        }

        const token = user.generateAuthToken()

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Logged in successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (err) {
        res.status(500).json({ message: "Something went wrong.", error: err.message })
    }
}

/**
 * @description Controller to logout the current user.
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await blacklistModel.create({ token })
        }

        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" })

        res.status(200).json({ message: "Logged out successfully." })

    } catch (err) {
        res.status(500).json({ message: "Something went wrong.", error: err.message })
    }
}

/**
 * @description Controller to get the current logged-in user's details.
 */
async function getMeController(req, res) {
    res.status(200).json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    })
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }
