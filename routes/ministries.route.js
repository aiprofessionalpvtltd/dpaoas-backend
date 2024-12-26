const express = require('express');
const router = express.Router();
const ministriesController = require("../controllers/ministries.controller");

// API Endpoints for Ministries
router.post("/ministries", ministriesController.createMinistry);
router.get("/ministries", ministriesController.getAllMinistries);
router.get("/ministries/:id", ministriesController.getMinistryById);
router.put("/ministries/:id", ministriesController.updateMinistry);
router.delete("/ministries/:id", ministriesController.deleteMinistry);
router.get('/ministries/tenure/:fkTenureId', ministriesController.getMinistriesByTenure);

module.exports = router;
