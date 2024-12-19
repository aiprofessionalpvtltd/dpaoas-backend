const express = require("express");
const router = express.Router();
const translationController = require("../controllers/translationRemarks.controller");


router.post("/create", translationController.createTranslationRemark);
//Getting Remarks 

router.get("/assigned/:userId", translationController.getAssignedRemarks);


// router.get("/remarks/:fkQuestionId", translationController.getTranslationRemarks);

//  Get Translation Branch  Hierarchy Api 
router.get("/getBranchHierarchy/:branchId", translationController.getBranchHierarchy);

router.get("/getTranslationHierarchy/:id", translationController.getTranslationHierarchy);




//Remarksss--------------
// POST route to create a remark
router.post("/remarks", translationController.createRemark);

// GET route to fetch remarks by questionId
// router.get("/remarks/:questionId",translationController. getRemarksByQuestionId);


router.get("/getremarks/:fkQuestionId", translationController.getRemarks);

module.exports = router;

