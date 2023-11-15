const express = require("express")
const router = express.Router()
// const multer = require("multer")
const loginLimiter = require("../middleware/loginLimiter")
const { requireSignIn } = require("../middleware/authMiddleware")
const {
	addPost,
	fetchPosts,
	fetchPost,
	toggle_like,
	fetch_user_posts,
	toggle_dislike,
	delete_post,
	update_post,
} = require("../controllers/postController")
const uploads = require("../middleware/uploadImage")

router.post("/add-post", requireSignIn, uploads.single("image"), addPost)
router.get("/posts", requireSignIn, fetchPosts)
router.get("/user/posts", requireSignIn, fetch_user_posts)
router.get("/posts/:id", requireSignIn, fetchPost)
router.post("/posts/likes/:id", requireSignIn, toggle_like)
router.post("/posts/dislikes/:id", requireSignIn, toggle_dislike)
router.delete("/posts/:id", requireSignIn, delete_post)
router.put("/posts/:id", requireSignIn, update_post)

module.exports = router
