//replace postSchema,ModelName with whatever you want
const mongoose = require("mongoose")

const postSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			index: true,
			required: [true, "Please provide a title"],
		},
		description: {
			type: String,
			required: [true, "Please provide description"],
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Category",
		},
		numViews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		dislikes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Comment",
			},
		],
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Only signed in users are allowed to post a blog"],
		},
		photo: {
			type: String,
			default:
				"https://images.unsplash.com/photo-1697588833877-22816039f9b6?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDd8Q0R3dXdYSkFiRXd8fGVufDB8fHx8fA%3D%3D",
		},
		cloudinary_id: {
			type: String,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true } }
)

postSchema.pre(/^find/, function (next) {
	// add views count field to the post data
	postSchema.virtual("viewsCount").get(function () {
		const post = this
		return post.numViews.length
	})

	// add likes count field to the post data
	postSchema.virtual("likesCount").get(function () {
		const post = this
		return post.likes.length
	})

	// add dislikes count field to the post data
	postSchema.virtual("dislikesCount").get(function () {
		const post = this
		return post.dislikes.length
	})

	postSchema.virtual("likesPercentage").get(function () {
		const post = this

		const numLikes = parseInt(post.likes.length) // 50
		const numDisLikes = parseInt(post.dislikes.length) // 20
		const totalLikesDislikes = numDisLikes + numLikes // 70
		const percentage = (numLikes / totalLikesDislikes) * 100
		return `${percentage}%`
	})

	postSchema.virtual("dislikesPercentage").get(function () {
		const post = this
		const numLikes = parseInt(post.likes.length)
		const numDisLikes = parseInt(post.dislikes.length)
		const totalLikesDislikes = numDisLikes + numLikes
		const percentage = (numDisLikes / totalLikesDislikes) * 100
		return `${percentage}%`
	})

	// posted 2 days ago
	// if the days the post was made is less than 0 return today, days is 1 it'll return  yesterday else return number of days ...
	postSchema.virtual("daysAgo").get(function () {
		const post = this
		const date = new Date(post.createdAt)
		const daysAgo = Math.floor((Date.now() - date) / 86400000)
		return daysAgo === 0
			? "Today"
			: daysAgo === 1
			? "Yesterday"
			: `${daysAgo} days ago`
	})

	next()
})

const Post = mongoose.model("Post", postSchema)
module.exports = Post
