const express = require('express');
const router = express.Router();
const contactLists = require("../controllers/contactLists.controller");

// Create a new contactList
router.post("/create", contactLists.createContactList);

// Retrieve all contactList
router.get("/", contactLists.findAllContactList);

// Retrieve Single contactList by its ID
router.get("/:id", contactLists.findSinlgeContactList);

// Update contactList
router.put("/update/:id", contactLists.updateContactList)

// Suspend/Delete contactList
router.delete("/delete/:id", contactLists.deleteContactList);

module.exports = router

