const express = require('express');
const router = express.Router();
const speechOnDemands = require("../controllers/speechOnDemands.controller");

// Retrieve all speechOnDemands by web_id
router.get("/", speechOnDemands.findAllSpeechOnDemandsByWebId);

// Create a new speechOnDemands
router.post("/", speechOnDemands.createSpeechOnDemands);

// Retrieve all speechOnDemands
router.get("/findall", speechOnDemands.findAllSpeechOnDemands);

// Retrieve SpeechOnDemands stats
router.get('/stats',speechOnDemands.getSpeechOnDemandsStats)

// Retrieve Single speechOnDemand by its ID
router.get("/:id", speechOnDemands.findSinlgeSpeechOnDemands);

// Update speechOnDemand
router.put("/:id", speechOnDemands.updateSpeechOnDemand)

// Suspend/Delete speechOnDemand
router.delete("/:id", speechOnDemands.deleteSpeechOnDemand);

module.exports = router

