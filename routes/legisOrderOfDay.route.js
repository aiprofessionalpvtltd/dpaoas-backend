const express = require("express");
const router = express.Router();
const legisOrderOfDayController = require("../controllers/legisOrderOfDay.controller");

router.post("/create", legisOrderOfDayController.create);
router.get("/", legisOrderOfDayController.findAll);
router.get("/:id", legisOrderOfDayController.findOne);
router.get("/session/:sessionId", legisOrderOfDayController.findBySession);
router.put("/update/:id", legisOrderOfDayController.update);
router.delete("/delete/:id", legisOrderOfDayController.delete);
router.put("/sendToTranslation/:id", legisOrderOfDayController.sendToTranslation);
router.put("/sendToLegislation/:id", legisOrderOfDayController.sendToLegislation);

module.exports = router;