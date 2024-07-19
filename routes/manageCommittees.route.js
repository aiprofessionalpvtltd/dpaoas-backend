const express = require('express');
const router = express.Router();
const manageCommittees = require("../controllers/manageCommittees.controller");

// Create a new Manage Committees
router.post("/", manageCommittees.createManageCommittees);

// Retrieve all Manage Committees
router.get("/", manageCommittees.findAllManageCommittees);

// Retrieve Single Manage Committee by its ID
router.get("/:id", manageCommittees.findSingleManageCommittee);

// Update Manage Committee
router.put("/update/:id", manageCommittees.updateManageCommittee)

// Suspend/Delete Manage Committee
router.delete("/delete/:id", manageCommittees.deleteManageCommittee);



module.exports = router

