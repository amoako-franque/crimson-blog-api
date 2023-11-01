const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
	{
		// user: {
		// 	type: mongoose.Schema.Types.ObjectId,
		// 	required: true,
		// },
		title: {
			type: String,
			required: [true, "Please provide a title"],
			trim: true,
		},
	},
	{ timestamps: true }
)

const Category = mongoose.model("Category", categorySchema)

module.exports = Category
