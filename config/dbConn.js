const mongoose = require("mongoose")

const dbCon = async () => {
	try {
		await mongoose.connect(process.env.DB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		console.log("MongoDB Connection Successful")
	} catch (error) {
		console.error(`Error in DB connection:: ${error.message}`)
		process.exit(1)
	}
}

module.exports = dbCon
