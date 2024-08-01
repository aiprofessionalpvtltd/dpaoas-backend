const express = require('express');
const router = express.Router();
const introducedInSenateBills = require("../controllers/introducedInSenateBills.controller");
const multer = require('multer');
const upload = multer();
const { uploadFile } = require('../common/upload');

// Create a new Senate Bill
router.post("/", upload.none(), introducedInSenateBills.createSenateBill);

// Retrieve all Senate Bills
router.get("/", introducedInSenateBills.findAllIntroducedInSenateBills);

router.get("/byCategory", introducedInSenateBills.findAllIntroducedInSenateBillsByCategory);

// search all Senate Bills
router.get("/search", introducedInSenateBills.searchAllIntroducedInSenateBills);

// Retrieve Single Senate Bill by its ID
router.get("/:id", introducedInSenateBills.findSinlgeIntroducedInSenateBill);

// Update Senate Bill
router.put("/update/:id", uploadFile("billdocument"), introducedInSenateBills.updateIntroducedInSenateBill)

// Suspend/Delete Senate Bill
router.delete("/delete/:id", introducedInSenateBills.deleteIntroducedInSenateBill);

module.exports = router

