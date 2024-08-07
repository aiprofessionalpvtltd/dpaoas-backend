const express = require('express');
const router = express.Router();
const mnas = require("../controllers/mnas.controller");

// Create a new MNA
router.post("/", mnas.createMNAs);

// Retrieve all MNAs
router.get("/", mnas.findAllMNAs);

// Fetch ministries related to a specific MNA
router.get("/:mnaId/ministries", mnas.findAllMinistriesByMinisterID);

// Retrieve Single MNA by its ID
router.get("/:id", mnas.findSingleMNA);

// Update MNA
router.put("/update/:id", mnas.updateMnaData)

// Suspend/Delete MNA
router.delete("/delete/:id", mnas.deleteMna);

module.exports = router