// routes/lawAct.route.js

const express = require('express');
const router = express.Router();
const lawActController = require("../../controllers/LDU/lawAct.controller");

// Retrieve all lawActs
router.get("/", lawActController.findAllLawActs);

// Create lawAct
router.post("/create", lawActController.createLawAct);

// Retrieve Single lawAct by its ID
router.get("/:id", lawActController.findSingleLawAct);

// Update lawAct
router.put("/update/:id", lawActController.updateLawAct);

// Suspend/Delete lawAct
router.delete("/delete/:id", lawActController.deleteLawAct);

module.exports = router;