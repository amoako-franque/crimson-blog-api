const express = require("express")
const router = express.Router()
const loginLimiter = require("../middleware/loginLimiter")
const {
	register,
	login,
	getUsers,
	getUser,
	unfollow,
} = require("../controllers/usersController")
const { requireSignIn } = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/login", login)
router.get("/users", requireSignIn, getUsers)
router.get("/user", requireSignIn, getUser)
router.post("/user/unfollow/:id", requireSignIn, unfollow)

module.exports = router
