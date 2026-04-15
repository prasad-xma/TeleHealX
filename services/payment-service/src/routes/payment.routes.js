const express = require("express");
const { createPayment } = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/checkout", protect, createPayment);

module.exports = router;