const cloudinary = require("cloudinary")
const { CloudinaryStorage } = require("multer-storage-cloudinary")

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

const storage = new CloudinaryStorage({
	cloudinary,
	allowedFormats: ["jpg", "png"],
	params: {
		folder: "crimson-blog-api",
		transformation: [{ width: 500, height: 500, crop: "limit" }],
	},
})

module.exports = storage
