const express = require("express")
const router = express.Router()

const { requireSignIn } = require("../middleware/authMiddleware")
const {
	comment,
	updateComment,
	deleteComment,
} = require("../controllers/commentController")

router.post("/comments/:id", requireSignIn, comment)
router.delete("/comments/:postId/:commentId", requireSignIn, deleteComment)
router.put("/comments/:id", requireSignIn, updateComment)

module.exports = router
