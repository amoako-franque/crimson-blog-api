const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
	{
		lastname: {
			type: String,
			required: true,
		},
		firstname: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		profilePic: {
			type: String,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
		comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
		blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	},
	{ timestamps: true, toJSON: { virtuals: true } }
)

userSchema.virtual("fullName").get(function () {
	return this.firstname + " " + this.lastname
})

// userSchema.virtual("postCount").get(function () {
// 	return this.post.length
// })

// userSchema.virtual("followersCount").get(function () {
// 	return this.followers.length
// })

// userSchema.virtual("followingCount").get(function () {
// 	return this.following.length
// })

// userSchema.virtual("viewersCount").get(function () {
// 	return this.viewers.length
// })

// userSchema.virtual("blockedCount").get(function () {
// 	return this.blocked.length
// })

const User = mongoose.model("User", userSchema)

module.exports = User
