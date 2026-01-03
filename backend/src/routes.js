const express = require("express")
const router = express.Router()

// User routes
const userRoutes = require("./users")
router.use("/user", userRoutes)

// Beer routes
const beerRoutes = require("./beers")
router.use("/beer", beerRoutes)

module.exports = router
