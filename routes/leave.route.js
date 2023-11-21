const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const {
    leaveRequestValidation,
} = require('../validation/leaveValidation')


router.post('/create', leaveRequestValidation, leaveController.createleave);

router.put('/:id', leaveController.updateleave);

module.exports = router;
