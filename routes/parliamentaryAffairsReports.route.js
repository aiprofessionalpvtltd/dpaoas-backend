const express = require('express');
const router = express.Router();
const parliamentaryAffairsReports = require("../controllers/parliamentaryAffairsReports.controller");

// Create a new Parliamentary Affairs Report
router.post("/create", parliamentaryAffairsReports.createReport);

// Retrieve all Parliamentary Affairs Reports with pagination
router.get("/all", parliamentaryAffairsReports.findAllReports);

// Search Parliamentary Affairs Reports
router.get("/search", parliamentaryAffairsReports.searchReports);

// Retrieve Single Parliamentary Affairs Report by ID
router.get("/single/:id", parliamentaryAffairsReports.findSingleReport);

// Update Parliamentary Affairs Report
router.put("/update/:id", parliamentaryAffairsReports.updateReport);

// Delete Parliamentary Affairs Report
router.delete("/delete/:id", parliamentaryAffairsReports.deleteReport);

module.exports = router;
