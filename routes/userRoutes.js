const express = require("express")
const router = express.Router()
const loginLimiter = require("../middleware/loginLimiter")
const { register, login, getUsers } = require("../controllers/usersController")
const { requireSignIn } = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/login", login)
router.get("/users", getUsers)

module.exports = router
