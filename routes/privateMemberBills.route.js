const express = require('express');
const router = express.Router();
const privateMemberBills = require("../controllers/privateMemberBills.controller");
const { uploadFile } = require('../common/upload');


// Retrieve all privateMemberBills by web_id
router.get("/", privateMemberBills.findAllPrivateMemberBillsByWebId);

// Retrieve all privateMemberBills
router.get("/findall", privateMemberBills.findAllPrivateMemberBills);

// Retrieve all privateMemberBills
router.get("/inNotice", privateMemberBills.findAllPrivateMemberBillsInNotice);

// Create privateMemberBill
router.post("/create", uploadFile("privateMemberBill"), privateMemberBills.createPrivateMemberBills);

// Retrieve Single privateMemberBill by its ID
router.get("/:id", privateMemberBills.findSinlgePrivateMemberBill);

router.put('/sendToLegislation/:id', privateMemberBills.sendToLegislation)

// Update privateMemberBill
router.put("/update/:id", uploadFile("privateMemberBill"), privateMemberBills.updatePrivateMemberBill);

// Suspend/Delete privateMemberBill
router.delete("/delete/:id", privateMemberBills.deletePrivateMemberBills);


module.exports = router