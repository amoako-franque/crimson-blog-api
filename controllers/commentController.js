const asyncHandler = require("express-async-handler")
const Comment = require("../models/Comment")
const Post = require("../models/Post")
const User = require("../models/User")

exports.comment = asyncHandler(async (req, res) => {
	const { content } = req.body
	const user = req.user
	const postId = req.params.id

	const post = await Post.findById(postId)

	if (!post) {
		return res.status(204).json({ message: "No post found" })
	}

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
			{ _id: id },
			{ content },
			{ new: true }
		)

		res.status(201).json({ data: updatedComment })
	} catch (error) {
		res.json(error)
	}
})

exports.deleteComment = asyncHandler(async (req, res) => {
	const { postId, commentId } = req.params

	try {
		const comment = await Comment.findById(commentId)
		if (comment.user.toString() !== req.user._id.toString()) {
			return res.status(400), json({ message: "Unauthorized" })
		}

		const post = await Post.findByIdAndUpdate(
			postId,
			{
				$pull: { comments: commentId },
			},
			{ new: true }
		)

		if (!post) {
			return res.status(400).send("Post not found")
		}

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{
				$pull: { comments: commentId },
			},
			{ new: true }
		)

		if (!user) {
			return res.status(400).send("User not found")
		}

		await Comment.findByIdAndDelete(req.params.commentId)

		res.status(201).json({
			message: "Comment deleted successfully",
			data: { user, post, com },
		})
	} catch (error) {
		res.json(error)
	}
})
