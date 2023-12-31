const multer = require("multer")
const path = require("path")
const sharp = require("sharp")

// Multer config
const uploads = multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname)
		if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
			cb(new Error("File type is not supported"), false)
			return
		}
		cb(null, true)
	},
	limits: { fileSize: 10 * 1024 * 1024 },
})

module.exports = uploads
