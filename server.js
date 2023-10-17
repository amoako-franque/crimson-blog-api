require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const fs = require("fs")
const { logger } = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbConn")
const mongoose = require("mongoose")
const loginLimiter = require("./middleware/loginLimiter")
const PORT = process.env.PORT || 3500

// connect to mongodb database
mongoose.set("strictQuery", true)
connectDB()

app.use(logger)
// app.use(loginLimiter)
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/", express.static(path.join(__dirname, "public")))

app.get("/", (req, res, next) => {
	res.sendFile(path.join(__dirname, "views", "index.html"))
})

// app.use("/auth", require("./routes/userRoutes"))

fs.readdirSync("./routes").map((route) => {
	app.use("/", require("./routes/" + route))
})

app.all("*", (req, res) => {
	res.status(404)
	if (req.accepts("html")) {
		res.sendFile(path.join(__dirname, "views", "404.html"))
	} else if (req.accepts("json")) {
		res.json({ message: "404 Not Found" })
	} else {
		res.type("txt").send("404 Not Found")
	}
})

app.use(errorHandler)

app.listen(PORT, () =>
	console.log(`Server listening on  http://localhost:${PORT}`)
)
