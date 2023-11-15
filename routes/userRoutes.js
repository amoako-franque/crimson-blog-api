const express = require("express")
const router = express.Router()
const loginLimiter = require("../middleware/loginLimiter")
const {
	register,
	login,
	getUsers,
	getUser,
	unfollow,
	forgotten_password_link,
	reset_password,
} = require("../controllers/usersController")
const { requireSignIn } = require("../middleware/authMiddleware")
const uploads = require("../middleware/uploadImage")

router.post("/register", uploads.single("image"), register)
router.post("/login", login)
router.get("/users", getUsers)
router.get("/user", requireSignIn, getUser)
router.post("/user/unfollow/:id", requireSignIn, unfollow)
router.post("/user/password-reset-token", forgotten_password_link)
router.put("/user/password-reset", reset_password)

module.exports = router
