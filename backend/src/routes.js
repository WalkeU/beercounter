const express = require("express")
const router = express.Router()

// User routes
const userRoutes = require("./users")
router.use("/user", userRoutes)

module.exports = router
