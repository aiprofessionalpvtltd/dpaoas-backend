const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const {
    leaveRequestValidation, leaveupdateValidation
} = require('../validation/leaveValidation')


router.post('/create', leaveRequestValidation, leaveController.createleave);

router.put('/:id', leaveupdateValidation, leaveController.updateleave);
router.get('/all', leaveController.getAllLeaves);
router.get('/:id', leaveController.getLeaveById);

module.exports = router;
