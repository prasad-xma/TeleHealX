const express = require("express");
const { handleWebhook } = require("../controllers/webhook.controller");

const router = express.Router();

router.post(
  "/stripe",
  express.raw({
    type: "*/*"
  }),
  handleWebhook
);

module.exports = router;