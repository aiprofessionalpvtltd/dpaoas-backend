const express = require('express');
const router = express.Router();
const privateMemberBills = require("../controllers/privateMemberBills.controller");


// Retrieve all privateMemberBills
router.get("/", privateMemberBills.findAllPrivateMemberBills);


// Update privateMemberBill
router.put("/update/:id", privateMemberBills.updatePrivateMemberBill)


module.exports = router