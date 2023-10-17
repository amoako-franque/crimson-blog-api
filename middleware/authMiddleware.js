const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")

exports.requireSignIn = asyncHandler(async (req, res, next) => {
	//console.log(req.headers)
	const authHeader = req.headers.authorization || req.headers.Authorization

	if (!authHeader?.startsWith("Bearer ")) {
		throw new Error("Unauthorized")
	}

	try {
		const token = authHeader.split(" ")[1]

		jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
			if (err) {
				return res.json({ message: "Invalid token" })
			}
			const userId = decoded.userId
			const user = await User.findById(userId).select("-password")
			req.user = user
			//   console.log({ user })
			next()
		})
	} catch (error) {
		error = new Error("Not Authorized token expired, Please Login again")
		error.status = 400
		throw error
	}
})

/**
 * @description Checks if user is admin or not
 * @returns boolean : true if user is admin and false if user is not admin
 */
exports.isAdmin = asyncHandler(async (req, res, next) => {
	const user = req.user

	if (user.role !== "Admin") {
		const error = new Error("You are not an admin. Contact your administrator")
		error.status = 400
		throw error
	} else {
		next()
	}
})
