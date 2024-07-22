const express = require('express');
const router = express.Router();
const billStatus = require("../controllers/billStatuses.controller");

// Create a new bill Status
router.post("/", billStatus.createBillStatus);

// Retrieve all bill Status
router.get("/", billStatus.findAllBillStatuses);

// Retrieve Single bill Status by its ID
router.get("/:id", billStatus.findSinlgeBillStatus);

// Update bill Status
router.put("/update/:id", billStatus.updateBillStatus)

// Suspend/Delete bill Status
router.delete("/delete/:id", billStatus.deleteBillStatus);



module.exports = router

