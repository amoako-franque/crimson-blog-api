const asyncHandler = require("express-async-handler")
const Comment = require("../models/Comment")
const Post = require("../models/Post")

exports.comment = asyncHandler(async (req, res) => {
	const { content } = req.body
	const user = req.user
	const postId = req.params.id

	const post = await Post.findById(postId)
	try {
		const comment = await Comment.create({
			user: user._id,
			content,
			post: post._id,
		})

		user.comments.push(comment._id)
		post.comments.push(comment._id)

		await post.save({ validateBeforeSave: false })
		await user.save({ validateBeforeSave: false })

		res.status(201).json({ message: "Comment submitted", data: comment })
	} catch (error) {
		res.status(400).json(error)
	}
})

exports.updateComment = asyncHandler(async (req, res) => {
	const { id } = req.params

	const { content } = req.body

	try {
		const comment = await Comment.findById(id)
		if (comment.user.toString() !== req.user._id.toString()) {
			return res.status(400), json({ message: "Unauthorized" })
		}

		const updatedComment = await Comment.findByIdAndUpdate(
			id,
			{ content },
			{ new: true, runValidators: true }
		)

		res.status(201).json({ updatedComment })
	} catch (error) {
		res.json(error)
	}
})

exports.deleteComment = asyncHandler(async (req, res) => {
	const { id } = req.params

	try {
		const comment = await Comment.findById(id)
		if (comment.user.toString() !== req.user._id.toString()) {
			return res.status(400), json({ message: "Unauthorized" })
		}

		const deletedComment = await Comment.findByIdAndUpdate(id)

		res.status(201).json({ message: "Comment deleted successfully" })
	} catch (error) {
		res.json(error)
	}
})
