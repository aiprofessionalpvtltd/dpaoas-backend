const express = require('express');
const router = express.Router();
const manageCommitteeRecomendations = require("../controllers/manageCommitteeRecomendations.controller");

// Create a new Manage Committees Recomendation
router.post("/", manageCommitteeRecomendations.createManageCommitteeRecomendations);

// Retrieve all Manage Committees Recomendation
router.get("/", manageCommitteeRecomendations.findAllManageCommitteeRecomendations);

// Retrieve Single Manage Committee Recomendation by its ID
router.get("/:id", manageCommitteeRecomendations.findSingleManageCommitteeRecomendations);

// Update Manage Committee Recomendations
router.put("/update/:id", manageCommitteeRecomendations.updateManageCommitteeRecomendations)

// Suspend/Delete Manage Committee Recomendations
router.delete("/delete/:id", manageCommitteeRecomendations.deleteManageCommitteeRecomendation);



module.exports = router

