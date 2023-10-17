const express = require("express")
const router = express.Router()
const loginLimiter = require("../middleware/loginLimiter")

router.post("/register", (req, res) => {
	res.send("hello routes")
})

module.exports = router
