const Post = require("../models/Post")
const User = require("../models/User")
const fs = require("fs")
const asyncHandler = require("express-async-handler")

/**
 * @description Create post by login users only
 * @returns post created by user who created the post
 * @requestBody { title, description, catId }
 * @routes "/add-post"
 */
exports.addPost = asyncHandler(async (req, res) => {
	const { title, description, catId } = req.body

	const user = req.user

	if (
		!title ||
		title === " " ||
		!description ||
		description === " " ||
		!catId
	) {
		return res.status(400).json({ message: "Please fill all fields" })
	}

	try {
		const post = await Post.create({
			title,
			description,
			category: catId,
			user: user._id,
			photo: req?.file?.path,
		})
		user.posts.push(post._id)

		await user.save()

		res.status(201).json({ message: "Post successfully created", data: post })
	} catch (error) {
		res.send(error)
	}
})

/**
 * @description Accessible to the public
 * @returns array of all posts in the database
 * @routes "/posts"
 */
exports.fetchPosts = asyncHandler(async (req, res) => {
	const posts = await Post.find()
		.populate("user", "firstname lastname")
		.populate("category", "title")
	const post_total = posts.length
	res.json({ data: { posts, post_total } })
})

/**
 * @description Private
 * @returns a single post from the database
 * @routes "/posts/:id"
 */
exports.fetchPost = asyncHandler(async (req, res) => {
	const postId = req.params.id
	const userId = req.user._id

	try {
		const post = await Post.findById(postId)

		const is_viewed = post.numViews.includes(userId)

		if (is_viewed) {
			return res.json({
				message: "Success",
				data: post,
			})
		} else {
			post.numViews.push(userId)
			await post.save()
			res.json({ message: "Success", data: post })
		}
	} catch (error) {
		return res.status(400).json({ errorMessage: "Try again later", error })
	}
})

exports.toggle_dislike = asyncHandler(async (req, res) => {
	const postId = req.params.id
	const userId = req.user._id

	try {
		const post = await Post.findById(postId)

		const is_unliked = post.dislikes.includes(userId)

		if (is_unliked) {
			post.dislikes = post.dislikes.filter(
				(dislike) => dislike.toString() !== userId.toString()
			)

			await post.save()
		} else {
			post.dislikes.push(userId)
			await post.save()
		}

		res.status(200).json({ message: "Success", data: post })
	} catch (error) {
		return res.status(400).json({ errorMessage: "Try again later", error })
	}
})

exports.toggle_like = asyncHandler(async (req, res) => {
	const postId = req.params.id
	const userId = req.user._id

	try {
		const post = await Post.findById(postId)

		const is_liked = post.likes.includes(userId)

		if (is_liked) {
			post.likes = post.likes.filter(
				(like) => like.toString() !== userId.toString()
			)

			await post.save()
		} else {
			post.likes.push(userId)
			await post.save()
		}

		res.status(200).json({ message: "Success", data: post })
	} catch (error) {
		return res.status(400).json({ errorMessage: "Try again later", error })
	}
})

exports.delete_post = asyncHandler(async (req, res) => {
	const postId = req.params.id
	const userId = req.user._id

	try {
		const post = await Post.findById(postId)
		if (post.user.toString() !== userId.toString()) {
			return res
				.status(400)
				.json({ errorMessage: "You are not authorized to delete this post " })
		}
		await Post.findByIdAndDelete({ _id: postId })

		res.status(204).json({ message: "Post has been deleted successfully" })
	} catch (error) {
		return res.status(500).json({ errorMessage: "Server error", error })
	}
})

exports.update_post = asyncHandler(async (req, res) => {
	const { title, description, catId } = req.body
	const postId = req.params.id
	const userId = req.user._id

	try {
		const post = await Post.findById(postId)
		if (post.user.toString() !== userId.toString()) {
			return res.status(400).json({
				errorMessage: "You are not authorized to update this post ",
			})
		}

		await Post.findByIdAndUpdate(
			{ _id: postId },
			{
				title: title || post?.title,
				description: description || post?.description,
				category: catId || postId?.category,
				photo: req?.file?.path || post?.photo,
			},
			{
				new: true,
			}
		)

		res
			.status(204)
			.json({ message: "Post has been updated successfully", data: post })
	} catch (error) {
		return res.status(500).json({ errorMessage: "Server error", error })
	}
})
