const jwt = require("jsonwebtoken")

exports.createToken = (user_id, email) => {
	return jwt.sign({ user_id, email }, process.env.JWT_TOKEN_SECRET)
}

//123456

exports.generateOTC = () => {
	const otc_string = "1234567890"

	let OTC = ""

	let len = otc_string.length

	for (let i = 0; i < 6; i++) {
		OTC += otc_string[Math.floor(Math.random() * len)]
	}

	return OTC
}
