const User = require("../models/User")
const bcrypt = require("bcrypt")
const asyncHandler = require("express-async-handler")
const { createToken } = require("../utils/generateToken")

exports.register = asyncHandler(async (req, res) => {
	const { firstname, lastname, email, password } = req.body

	if (!firstname || !email || !lastname) {
		return res.status(400).json({ message: "please fill all fields" })
	}

	if (password && password.length < 6) {
		return res
			.status(400)
			.json({ message: "Password must be at least 6 characters" })
	}

	const userExists = await User.findOne({ email })

	if (userExists) {
		return res
			.status(400)
			.json({ message: "User already exists. Please login" })
	}

	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt)

	const user = await User.create({
		firstname,
		lastname,

		email,
		password: hashedPassword,
	})

	if (user) {
		user.password = undefined
		user.secret = undefined

		return res.status(201).json({
			message: "Registration completed. Please login to continue",
			data: user,
		})
	} else {
		return res
			.status(500)
			.json({ error: "Registration failed. Please try again later" })
	}
})

exports.login = asyncHandler(async (req, res) => {
	const { email, password } = req.body

	// password: "234219u31209u3109u230"
	// password: "!%98uh891y312312323eh9823y981h2i3h19280h31un938h2389h289he9812he"

	const user = await User.findOne({ email })

	const match = await bcrypt.compare(password, user.password) // false or true

	if (match) {
		user.password = undefined

		const userToken = createToken(user._id, user.email)

		res.cookie("token", userToken, {
			httpOnly: true,
			maxAge: 2 * 24 * 60 * 60 * 1000,
			secure: true,
		})

		res.status(200).json({ message: `Welcome back ${user.firstname}` })
	} else {
		res.status(400).json({ msg: "Invalid credentials" })
	}
})

exports.logout = asyncHandler(async (req, res) => {
	try {
		const cookies = req.cookies
		if (!cookies?.jwt) return res.sendStatus(204) //No content
		res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true })
		res.status(200).json({ msg: "Logout successfully" })
	} catch (error) {
		throw new Error("Something went wrong")
	}
})

exports.getUsers = asyncHandler(async (req, res) => {
	console.log(req.header)
	console.log(req.headers)
	const users = await User.find({}).select("-password").lean()
	res.status(200).json({ users })
})
