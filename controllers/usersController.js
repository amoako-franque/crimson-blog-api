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

	if (!email || email == "" || !password || password == "") {
		return res.status(400).json({ message: "Please fill all fields" })
	}

	const user = await User.findOne({ email })

	if (!user) {
		return res.status(400).json({ message: "Invalid user credentials" })
	}

	const match = await bcrypt.compare(password, user.password) // false or true

	if (match) {
		user.password = undefined

		const userToken = createToken(user._id, user.email)

		res.cookie("token", userToken, {
			httpOnly: true,
			maxAge: 2 * 24 * 60 * 60 * 1000,
			// secure: true,
		})

		res.status(200).json({ message: `Welcome back ${user.firstname}` })
	} else {
		res.status(400).json({ msg: "Invalid credentials" })
	}
})

exports.logout = asyncHandler(async (req, res) => {
	try {
		const cookies = req?.cookies
		if (!cookies?.token) return res.sendStatus(204) //No content
		res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true })
		res.status(200).json({ msg: "Logout successfully" })
	} catch (error) {
		throw new Error("Something went wrong")
	}
})

exports.getUsers = asyncHandler(async (req, res) => {
	const users = await User.find({}).select("-password").lean()
	res.status(200).json({ data: users })
})

// exports.profileVisitors = asyncHandler(async (req, res) => {
// 	try {
// 		const user = await User.findById(req.params.id)
// 	} catch (error) {}
// })
