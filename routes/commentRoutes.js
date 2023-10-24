const express = require("express")
const router = express.Router()

const { requireSignIn } = require("../middleware/authMiddleware")
const {
	comment,
	updateComment,
	deleteComment,
} = require("../controllers/commentController")

router.post("/comment", requireSignIn, comment)
router.delete("/comment/:id", requireSignIn, deleteComment)
router.put("/comment/:id", requireSignIn, updateComment)

module.exports = router
