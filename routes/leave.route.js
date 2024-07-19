const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const {
    leaveRequestValidation, leaveupdateValidation
} = require('../validation/leaveValidation')

/**
 * @swagger
 * /api/leave/create:
 *   post:
 *     summary: Create Leave
 *     tags: [Leave]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fkRequestTypeId:
 *                 type: integer
 *                 description: fk Request Type Id
 *               fkUserId:
 *                 type: integer
 *                 description: fk User Id
 *               requestStatus:
 *                 type: string
 *                 description: request Status
 *               requestStartDate:
 *                 type: string
 *                 description: request Start Date
 *               requestEndDate:
 *                 type: string
 *                 description: request End Date
 *               requestLeaveSubType:
 *                 type: string
 *                 description: request Leave SubType  
 *               requestLeaveReason:
 *                 type: string
 *                 description: request Leave Reason
 *               requestNumberOfDays:
 *                 type: string
 *                 description: request Number Of Days
 *               requestLeaveSubmittedTo:
 *                 type: string
 *                 description: request Leave SubmittedTo  
 *               requestLeaveApplyOnBehalf:
 *                 type: string
 *                 description: request Leave Apply On Behalf
 *               requestLeaveForwarder:
 *                 type: string
 *                 description: request Leave Forwarder
 *               requestStationLeave:
 *                 type: string
 *                 description: request Station Leave
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be attached
 *     responses:
 *       '200':
 *         description: A successful response
 */

router.post('/create', leaveRequestValidation, leaveController.createleave);

// Retrieve all Leaves Type
/**
 * @swagger
 * /api/leave/types/:
 *   get:
 *     summary: Get All Leaves Type
 *     tags: [Leave]
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/types', leaveController.getLeaveTypes);

// Search Leave
/**
 * @swagger
 * /api/leave/search/:
 *   get:
 *     summary: Get Search Leaves
 *     tags: [Leave]
 *     parameters:
 *       - in: query
 *         name: employeeName
 *         schema:
 *           type: string
 *         description: The term to search for in departments
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: The term to search for in departments 
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: The term to search for in departments  
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/search', leaveController.search);

// Update Leave
/**
 * @swagger
 * /api/leave/{id}:
 *   put:
 *     summary: Get Updated Leave
 *     tags: [Leave]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkRequestTypeId:
 *                 type: integer
 *                 description: fk Request Type Id
 *               fkUserId:
 *                 type: integer
 *                 description: fk UserId
 *               requestStatus:
 *                 type: string
 *                 description: request Status
 *               requestStartDate:
 *                 type: date
 *                 description: request StartDate
 *               requestLeaveSubType:
 *                 type: string
 *                 description: request Leave SubType
 *               requestLeaveReason:
 *                 type: string
 *                 description: request Leave Reason    
 *               requestNumberOfDays:
 *                 type: string
 *                 description: request Number Of Days
 *               requestLeaveSubmittedTo:
 *                 type: string
 *                 description: request Leave SubmittedTo
 *               requestLeaveApplyOnBehalf:
 *                 type: string
 *                 description: request Leave Apply On Behalf
 *               requestLeaveForwarder:
 *                 type: string
 *                 description: request Leave Forwarder
 *               leaveComment:
 *                 type: string
 *                 description: leave Comment
 *               commentedBy:
 *                 type: integer
 *                 description: commented By
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put('/:id', leaveupdateValidation, leaveController.updateleave);
// Retrieve all Leaves
/**
 * @swagger
 * /api/leave/all/:
 *   get:
 *     summary: Get All Leaves
 *     tags: [Leave]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Current page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/all', leaveController.getAllLeaves);

//Get Single Leave
/**
 * @swagger
 * /api/leave/{id}:
 *   get:
 *     summary: Get Single Leaves
 *     tags: [Leave]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/:id', leaveController.getLeaveById);

//Get All Leaves Of User Leave
/**
 * @swagger
 * /api/leave/getAllLeavesOfUser/{id}:
 *   get:
 *     summary: Get Single Leaves
 *     tags: [Leave]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave ID
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Current page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/getAllLeavesOfUser/:id', leaveController.getAllLeavesOfUser);


module.exports = router;
