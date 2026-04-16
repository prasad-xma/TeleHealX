const express = require("express");
const {
  getPaymentModuleInfo,
  createCheckoutSession
} = require("../controllers/payment.controller");

const router = express.Router();

router.get("/", getPaymentModuleInfo);
router.post("/checkout", createCheckoutSession);

module.exports = router;