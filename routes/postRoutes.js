const express = require("express")
const router = express.Router()
const multer = require("multer")
const loginLimiter = require("../middleware/loginLimiter")
const { requireSignIn } = require("../middleware/authMiddleware")
const {
	addPost,
	fetchPosts,
	fetchPost,
	toggle_like,
} = require("../controllers/postController")
const storage = require("../utils/cloudinary")

const upload = multer({ storage })

router.post("/add-post", requireSignIn, upload.single("image"), addPost)
router.get("/posts", fetchPosts)
router.get("/posts/:id", requireSignIn, fetchPost)
router.get("/posts/:id", requireSignIn, fetchPost)
router.get("/posts/likes/:id", requireSignIn, toggle_like)
router.get("/posts/dislikes/:id", requireSignIn, toggle_like)
router.get("/posts/dislikes/:id", requireSignIn, toggle_like)

module.exports = router
