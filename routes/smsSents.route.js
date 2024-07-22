const express = require('express');
const router = express.Router();
const smsSents = require("../controllers/smsSents.controller");

// Sent sms messages to the users
router.post("/create", smsSents.createSmsSent);

// Retrieve all sms messages
router.get("/", smsSents.findAllSmsSent);

module.exports = router

