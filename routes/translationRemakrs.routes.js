const express = require("express");
const router = express.Router();
const translationController = require("../controllers/translationRemarks.controller");


router.post("/create", translationController.createTranslationRemark);

router.get("/remarks/:fkQuestionId", translationController.getTranslationRemarks);

//  Get IT Branch Hierarchy Api 
router.get("/getUserBranchHierarchy/:id",translationController.getUserBranchHierarchy);

router.get("/getTranslationHierarchy/:id", translationController.getTranslationHierarchy);



module.exports = router;
