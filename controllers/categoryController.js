const asyncHandler = require("express-async-handler")
const Category = require("../models/Category")

exports.createCategory = asyncHandler(async (req, res) => {
	try {
		let categoryExists = await Category.findOne({ title: req.body.title })

		if (categoryExists) {
			return res.json({
				message: `Category with ${req.body.title} already exits.`,
			})
		}

		const category = await Category.create({
			title: req.body.title,
		})

		res.status(201).json({ category })
	} catch (error) {
		res.status(400).json(error)
	}
})

exports.fetchCategory = asyncHandler(async (req, res) => {
	const { id } = req.params
	try {
		const category = await Category.findById(id)

		res.status(201).json({ category })
	} catch (error) {
		res.status(400).json(error)
	}
})

exports.fetchCategories = asyncHandler(async (req, res) => {
	try {
		const categories = await Category.find({}).sort({ createdAt: "-1" })
		res.status(201).json({ categories })
	} catch (error) {
		res.status(400).json(error)
	}
})

exports.updateCategory = asyncHandler(async (req, res) => {
	const { id } = req.params

	try {
		const cat = await Category.findByIdAndUpdate(id, req.body, { new: true })
		res.json({ data: cat })
	} catch (error) {
		res.json(error)
	}
})

exports.deleteCategory = asyncHandler(async (req, res) => {
	const { id } = req.params
	try {
		await Category.findByIdAndDelete(id)
		res.json({
			message: "Deleted successfully",
		})
	} catch (error) {
		res.json(error)
	}
})
