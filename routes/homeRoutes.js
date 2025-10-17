const express = require("express");

// controller/handler functions
const {
  getIndexHandler,
  postIndexHandler,
} = require("../controllers/homeController");


const router = express.Router();

// all routes are protected

router.route("/").get(getIndexHandler).post(postIndexHandler);

module.exports = router;
