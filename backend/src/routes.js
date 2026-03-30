const express = require("express")
const router = express.Router()

// User routes
const userRoutes = require("./users")
router.use("/user", userRoutes)

// Beer routes
const beerRoutes = require("./beers")
router.use("/beer", beerRoutes)

// Admin routes
const adminRoutes = require("./admin")
router.use("/admin", adminRoutes)

// Public routes
const publicRoutes = require("./public")
router.use("/public", publicRoutes)

// Notice routes
const noticeRoutes = require("./notices")
router.use("/notice", noticeRoutes)

module.exports = router
