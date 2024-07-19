const express = require('express');
const router = express.Router();
const researchServices = require("../controllers/researchServices.controller");
const {uploadFile} = require('../common/upload')

// Retrieve all researchServices by web_id
router.get("/", researchServices.findAllResearchServiceByWebId);

// Get Research Services Stats
router.get("/stats", researchServices.getResearchServicesStats)

// Create a new researchServices
router.post("/", researchServices.createResearchServices);

// Retrieve all researchServices
router.get("/findall", researchServices.findAllResearchServices);

// // Retrieve Single research Service by its ID
router.get("/:id", researchServices.findSinlgeResearchService);



// Update research Service
router.put("/:id", uploadFile('researchService'), researchServices.updateResearchService)

// Suspend/Delete research Service
router.delete("/:id", researchServices.deleteResearchService);

module.exports = router

