const jwt = require("jsonwebtoken")

exports.createToken = (user_id, email) => {
	return jwt.sign({ user_id, email }, process.env.JWT_TOKEN_SECRET)
}
