const express = require('express');
const router = express.Router();
const branches = require('../controllers/branches.controller');

// Create a new Branch
router.post("/createBranch", branches.createBranch);

// Retrieve all Branch
router.get("/", branches.findAllBranches);

// Single Branch
router.get("/:id", branches.findSingleBranch);

// Update Branch
router.put("/update/:id", branches.updateBranch);

// Suspend/Delete Branch
router.put("/delete/:id", branches.suspendBranch);

module.exports = router;
