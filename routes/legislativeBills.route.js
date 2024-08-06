const express = require('express');
const router = express.Router();
const legislativeBills = require("../controllers/legislativeBills.controller");
const { uploadFile } = require('../common/upload');

// Retrieve all legislativeBills by web_id
router.get("/", legislativeBills.findAllLegislativeBillsByWebId);

// Retrieve all legislativeBills
router.get("/findall", legislativeBills.findAllLegislativeBills);

// Retrieve all legislativeBills
router.get("/inNotice", legislativeBills.findAllLegislativeBillsInNotice);

// Create legislativeBill
router.post("/", uploadFile("legislativeBill"), legislativeBills.createLegislativeBill);

// Retrieve Single legislativeBill by its ID
router.get("/:id", legislativeBills.findSingleLegislativeBill);

// Update legislativeBill
router.put("/:id", uploadFile("legislativeBill"), legislativeBills.updateLegislativeBill);

router.put('/sendToLegislation/:id', legislativeBills.sendToLegislation)

// Suspend/Delete legislativeBill
router.delete("/:id", legislativeBills.deleteLegislativeBill);


module.exports = router