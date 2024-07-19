const express = require('express');
const router = express.Router();
const contactTemplates = require("../controllers/contactTemplates.controller");

// Create a new ContactTemplate
router.post("/create", contactTemplates.createContactTemplate);

// Retrieve all ContactTemplates
router.get("/", contactTemplates.findAllContactTemplates);

// Retrieve Single ContactTemplate by its ID
router.get("/:id", contactTemplates.findSinlgeContactTemplate);

// Update ContactTemplate
router.put("/update/:id", contactTemplates.updateContactTemplate)

// Suspend/Delete ContactTemplate
router.delete("/delete/:id", contactTemplates.deleteContactTemplate);

module.exports = router

