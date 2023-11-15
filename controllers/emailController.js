const nodemailer = require("nodemailer")
const asyncHandler = require("express-async-handler")

const sendEmail = asyncHandler(async (data, req, res) => {
	let transporter = nodemailer.createTransport({
		host: process.env.NODEMAILER_HOST,
		// service: process.env.NODEMAILER_SERVICE,
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.USER_MAIL_ID,
			pass: process.env.USER_SECRET,
		},
	})

	await transporter.sendMail({
		from: process.env.USER_MAIL_ID,
		to: data.to,
		subject: data.subject,
		text: data.text,
		html: data.html,
	})
})

module.exports = sendEmail
