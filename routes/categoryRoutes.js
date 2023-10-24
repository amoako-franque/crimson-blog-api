const express = require("express")
const router = express.Router()

const { requireSignIn } = require("../middleware/authMiddleware")
const {
	createCategory,
	fetchCategories,
	fetchCategory,
	deleteCategory,
	updateCategory,
} = require("../controllers/categoryController")

router.post("/add-category", requireSignIn, createCategory)
router.get("/categories", fetchCategories)
router.get("/categories/:id", fetchCategory)
router.delete("/categories/:id", requireSignIn, deleteCategory)
router.put("/categories/:id", requireSignIn, updateCategory)

module.exports = router
