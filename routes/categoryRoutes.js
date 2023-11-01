const express = require("express")
const router = express.Router()

const { requireSignIn, isAdmin } = require("../middleware/authMiddleware")
const {
	createCategory,
	fetchCategories,
	fetchCategory,
	deleteCategory,
	updateCategory,
} = require("../controllers/categoryController")

router.post("/add-category", requireSignIn, isAdmin, createCategory)
router.get("/categories", fetchCategories)
router.get("/categories/:id", fetchCategory)
router.delete("/categories/:id", requireSignIn, isAdmin, deleteCategory)
router.put("/categories/:id", requireSignIn, isAdmin, updateCategory)

module.exports = router
