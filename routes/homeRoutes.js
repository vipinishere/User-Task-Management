const express = require("express")

// controller/handler functions
const { getIndexHandler, postIndexHandler } = require("../controllers/homeController")

const router = express.Router()


router.route("/")
    .get(getIndexHandler)
    .post(postIndexHandler)


module.exports = router