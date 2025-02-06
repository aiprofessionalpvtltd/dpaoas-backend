const express = require("express");
const router = express.Router();
const translationController = require("../controllers/translationRemarks.controller");

//  Get Translation Branch  Hierarchy Api 
router.get("/getBranchHierarchy/:branchId/:userId", translationController.getBranchHierarchy);

router.get("/getTranslationHierarchy/:id", translationController.getTranslationHierarchy);

// POST route to create a remark
router.post("/remarks/:userId", translationController.createRemark);

// GET route to fetch remarks by questionId
router.get("/getremarks/:fkQuestionId/:userId", translationController.getRemarks);
router.get("/getMotionIdRemarks/:fkMotionId/:userId", translationController.getMotionIdRemarks);
router.get("/getResolutionIdRemarks/:fkResolutionId/:userId", translationController.getResolutionIdRemarks);

// GET route to fetch remarks by questionId - now supports ?category=Question|Motion|Resolution|IntroducedBills
router.get("/getAllRemarks/:userId?", translationController.getAllRemarks);

// Motion-specific routes
router.get("/getmotion-remarks/:fkMotionId/:userId", translationController.getMotionRemarks);
router.get("/getAllMotionRemarks/:userId?", translationController.getAllMotionRemarks);

// Resolution-specific routes
router.get("/getresolution-remarks/:fkResolutionId/:userId", translationController.getResolutionRemarks);
router.get("/getAllResolutionRemarks/:userId?", translationController.getAllResolutionRemarks);

// IntroducedBills-specific routes
router.get("/getintroducedbill-remarks/:fkIntroducedInSenateId/:userId", translationController.getIntroducedBillRemarks);
router.get("/getAllIntroducedBillRemarks/:userId?", translationController.getAllIntroducedBillRemarks);

module.exports = router;

