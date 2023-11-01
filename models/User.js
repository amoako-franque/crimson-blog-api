const mongoose = require("mongoose")
const Post = require("./Post")

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
		password_reset_token: String,
		password_reset_token_expiry: Date,
	},
	{ timestamps: true, toJSON: { virtuals: true } }
)

userSchema.pre("findOne", async function (next) {
	//   populate user posts
	this.populate({
		path: "posts",
	})

	const userId = this._conditions._id

	const posts = await Post.find({ user: userId })

	const last_post = posts[posts.length - 1]

	const last_post_date = new Date(last_post?.createdAt)

	const last_post_dateStr = last_post_date.toDateString()

	userSchema.virtual("last_post_date").get(function () {
		return last_post_dateStr
	})

	const current_date = new Date()

	const diff_date = current_date - last_post_date

	const diff_in_days = diff_date / (1000 * 3600 * 24)

	if (diff_in_days > 30) {
		userSchema.virtual("is_inactive").get(function () {
			return true
		})

		await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true })
	} else {
		userSchema.virtual("is_inactive").get(function () {
			return false
		})
		await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true })
	}

	const daysAgo = Math.floor(diff_in_days)
	userSchema.virtual("last_active").get(function () {
		if (daysAgo <= 0) {
			return "Today"
		}
		if (daysAgo === 1) {
			return "Yesterday"
		}
		if (daysAgo > 1) {
			return `${daysAgo} days ago `
		}
	})
})

userSchema.virtual("fullName").get(function () {
	return this.firstname + " " + this.lastname
})

userSchema.virtual("postCount").get(function () {
	return this.post.length
})

userSchema.virtual("followersCount").get(function () {
	return this.followers.length
})

userSchema.virtual("followingCount").get(function () {
	return this.following.length
})

userSchema.virtual("viewersCount").get(function () {
	return this.viewers.length
})

userSchema.virtual("blockedCount").get(function () {
	return this.blocked.length
})

const User = mongoose.model("User", userSchema)

module.exports = User
