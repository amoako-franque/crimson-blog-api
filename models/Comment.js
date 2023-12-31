const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		content: {
			type: String,
			required: [true, "Please provide a title"],
			trim: true,
		},
		post: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Post",
		},
	},
	{ timestamps: true }
)

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment
