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

exports.getUser = asyncHandler(async (req, res) => {
	const user = req.user
	const found_user = await User.findById({ id: user._id })
		.select("-password")
		.lean()
	res.status(200).json({ data: found_user })
})

exports.profileVisitors = asyncHandler(async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ message: "Log in to continue" })
	}
	const user = req.user
	try {
		// find the user profile
		const user = await User.findById(req.params.id)

		// the logged in user
		const profile_viewer = await User.findById({ id: user._id })

		if (user && profile_viewer) {
			const is_viewed = user.viewers.find(
				(viewer) => viewer.toString() === profile_viewer._id.toString()
			)
			if (is_viewed) {
				return res
					.status(400)
					.json({ message: "You have already viewed this profile!" })
			} else {
				user.viewers.push(profile_viewer._id)
				await user.save()
				res.status(200).json({ message: "Profile viewed!" })
			}
		}
	} catch (error) {
		console.log(error)
	}
})

exports.following = asyncHandler(async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ message: "please log in to continue" })
	}

	try {
		// https://www.x.com/slightly/12312983y21893y9
		// find the user to follow
		const user_to_follow = await User.findById(req.params.id)

		// find the user who is following
		const user_who_followed = await User.findById({ id: req.user._id })

		if (user_to_follow && user_who_followed) {
			const is_followed = user_who_followed.following.find(
				(follower) => follower.toString() === user_who_followed._id.toString()
			)

			if (is_followed) {
				return res.json({
					message: `You are already following ${user_to_follow.firstname}`,
				})
			} else {
				// add the user to the followers list of the user who is following
				user_to_follow.followers.push(user_who_followed._id)

				// add the user who is following to the following list of the user to follow
				user_who_followed.following.push(user_to_follow._id)

				// save
				await user_who_followed.save()
				await user_to_follow.save()

				res
					.status(200)
					.json({ message: `You followed ${user_to_follow.firstname}` })
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Unable to follow. Network problem." })
	}
})

exports.unfollow = asyncHandler(async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ message: "please log in to continue" })
	}

	try {
		// url : https://www.x.xom/slightly/8273t429y98y3498
		// slug :
		//1. find the user to unfollow
		// user1
		const user_to_unfollow = await User.findById(req.params.id)

		//2. find user who is unfollowing
		// user2
		const user_who_unfollowed = await User.findById({ id: req.user._id })

		//3. check if user_to_unfollow and user_who_unfollowed are found
		if (user_to_unfollow && user_who_unfollowed) {
			//4. check if user_who_unfollowed is already in the user_to_unfollow followers array

			const is_followed = user_to_unfollow.followers.find(
				(follower) => follower.toString() === user_who_unfollowed._id.toString()
			)

			if (!is_followed) {
				return res
					.status(200)
					.json({ message: "You are not following the user" })
			} else {
				//5. remove user_who_unfollowed [ user2 ]from user_to_unfollow [user1] followers list
				user_to_unfollow.followers = user_to_unfollow.followers.filter(
					(follower) =>
						follower.toString() !== user_who_unfollowed._id.toString()
				)

				//6. save the  updated user data
				await user_to_unfollow.save()

				//7. remove the user_to_unfollow [user1] from the following list of the user_who_unfollowed [user2]
				user_who_unfollowed.following = user_who_unfollowed.following.filter(
					(follower) => follower.toString !== user_to_unfollow._id.toString()
				)
				// 8. save user data
				await user_who_unfollowed.save()
				return res.status(200).json({ message: "You unfollowed the user" })
			}
		} else {
			return res.status(400).json({ message: "Something wrong happened" })
		}
	} catch (error) {
		return res.status(500).json({ message: "Try again later" })
	}
})

exports.unblock_users = asyncHandler(async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ message: "please log in to continue" })
	}

	try {
		const user_to_be_unblocked = await User.findById(req.params.id)
		const user_who_unblocked = await User.findById(req.user._id)

		if (user_to_be_unblocked && user_who_unblocked) {
			const is_user_blocked = user_who_unblocked.blocked.find(
				(userId) => userId.toString() === user_to_be_unblocked._id.toString()
			)

			if (!is_user_blocked) {
				return res.status(200).json({ message: "User is is not blocked" })
			}

			user_who_unblocked.blocked = user_who_unblocked.blocked.filter(
				(block) => block.toString() !== user_to_be_unblocked._id.toString()
			)

			await user_who_unblocked.save()

			return res.status(200).json({ message: "User unblocked successfully" })
		}
	} catch (error) {
		return res.status(500).json({ message: "Server error" })
	}
})

exports.block_users = asyncHandler(async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ message: "please log in to continue" })
	}

	try {
		const user_to_be_blocked = await User.findById(req.params.id)
		const user_who_blocked = await User.findById(req.user._id)

		if (user_to_be_blocked && user_who_blocked) {
			const is_user_blocked = user_who_blocked.blocked.find(
				(userId) => userId.toString() === user_to_be_blocked._id.toString()
			)

			if (is_user_blocked) {
				return res.status(200).json({ message: "User is already blocked" })
			}

			user_who_blocked.blocked.push(user_to_be_blocked._id)

			await user_who_blocked.save()

			return res.status(200).json({ message: "User blocked successfully" })
		}
	} catch (error) {
		return res.status(500).json({ message: "Server error" })
	}
})

exports.block_users_by_admin = asyncHandler(async (req, res) => {
	try {
		const user_to_be_blocked = await User.findById(req.params.id)

		if (!user_to_be_blocked) {
			return res.status(200).json({ message: "user not found" })
		}

		user_to_be_blocked.isBlocked = true
		await user_to_be_blocked.save()

		return res.status(200).json({ message: "User has been blocked" })
	} catch (error) {
		return res.json(error)
	}
})

exports.unblock_users_by_admin = asyncHandler(async (req, res) => {
	try {
		const user_to_be_unblocked = await User.findById(req.params.id)

		if (!user_to_be_unblocked) {
			return res.status(200).json({ message: "user not found" })
		}

		user_to_be_unblocked.isBlocked = false
		await user_to_be_unblocked.save()

		return res.status(200).json({ message: "User has been blocked" })
	} catch (error) {
		return res.json(error)
	}
})

exports.user_profile = asyncHandler(async (req, res) => {})
exports.update_user_profile = asyncHandler(async (req, res) => {})
exports.update_user_password = asyncHandler(async (req, res) => {})
exports.delete_user_account = asyncHandler(async (req, res) => {})
exports.update_profile_pic = asyncHandler(async (req, res) => {})
exports.forgotten_password_link = asyncHandler(async (req, res) => {})
exports.reset_password = asyncHandler(async (req, res) => {})
