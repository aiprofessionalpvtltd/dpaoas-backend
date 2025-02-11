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

// GET route to fetch remarks by questionId - now supports ?category=Question|Motion|Resolution|IntroducedBills
router.get("/getMotionIdRemarks/:fkMotionId/:userId", translationController.getMotionIdRemarks);
router.get("/getAllRemarks/:userId?", translationController.getAllRemarks);

// Motion-specific routes
router.get("/getAllMotionRemarks/:userId?", translationController.getAllMotionRemarks);
router.get("/getResolutionIdRemarks/:fkResolutionId/:userId", translationController.getResolutionIdRemarks);

// Resolution-specific routes
router.get("/getAllResolutionRemarks/:userId?", translationController.getAllResolutionRemarks);

// Government Bills routes
// single
router.get("/getgovernmentbill-remarks/:fkIntroducedInSenateId/:userId", translationController.getGovernmentBillRemarks);
// get all
router.get("/getAllGovernmentBillRemarks/:userId?", translationController.getAllGovernmentBillRemarks);

// Finance Money Bills routes
// single bill remarks
router.get("/getfinancebill-remarks/:fkFinanceMoneyBillId/:userId", translationController.getFinanceMoneyBillRemarks);
// get all finance bills with remarks
router.get("/getAllFinanceMoneyBillRemarks/:userId?", translationController.getAllFinanceMoneyBillRemarks);

module.exports = router;

