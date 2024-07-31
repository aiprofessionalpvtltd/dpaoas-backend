const express = require('express');
const router = express.Router();

const leaveController = require('../controllers/leave.controller');
const {
    leaveRequestValidation, leaveupdateValidation
} = require('../validation/leaveValidation');
const { uploadFile } = require('../common/upload');


router.post('/create', uploadFile('leave'), leaveController.createleave);
router.get("/", leaveController.findAllLeaveByWebId);
router.get('/types', leaveController.getLeaveTypes);
router.get('/search', leaveController.search);
router.put('/:id', uploadFile('leave'), leaveController.updateleave);
router.get('/all', leaveController.getAllLeaves);
router.get('/:id', leaveController.getLeaveById);
router.get('/getAllLeavesOfUser/:id', leaveController.getAllLeavesOfUser);


module.exports = router;