const express = require('express');
const router = express.Router();
const files = require('../controllers/filesDashboard.controller');


// Get Files Stats
/**
 * @swagger
 * /api/filesDashboard/stats:
 *   get:
 *     summary: Get File Stats
 *     tags: [Files Dashboard]
 *     security:
 *       - BearerAuth: [] 
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/stats", files.getFilesStats);

//Stats For Sent And Received
/**
 * @swagger
 * /api/filesDashboard/sentAndRecievedFiles/{id}:
 *   get:
 *     summary: Stats For Sent And Received
 *     tags: [Files Dashboard]
 *     security:
 *       - BearerAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/sentAndRecievedFiles/:id', files.getFileSentAndReceivedStats)

// Get Approval Stats
/**
 * @swagger
 * /api/filesDashboard/approvalStats/{id}:
 *   get:
 *     summary: Get File  Approval Stats
 *     tags: [Files Dashboard]
 *     security:
 *       - BearerAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/approvalStats/:id',files.getFileApprovalStats)

//  Files Pending For Assigned To User
/**
 * @swagger
 * /api/filesDashboard/notifiedFiles/{id}:
 *   get:
 *     summary:  Files Pending For Assigned To User
 *     tags: [Files Dashboard]
 *     security:
 *       - BearerAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/notifiedFiles/:id',files.getFilesPendingCount)

module.exports = router