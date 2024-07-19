const express = require('express');
const router = express.Router();
const noticeOfficeReport = require('../controllers/noticeOfficeReport.controller');


// Get Questions,Motions and Resolutions according to notice office diary date
/**
 * @swagger
 * /api/noticeOfficeReport/:
 *   get:
 *     summary: Get Questions,Motions and Resolutions according to notice office diary date
 *     tags: [Notice Office Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: noticeOfficeDiaryDateFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: noticeOfficeDiaryDateTo
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/", noticeOfficeReport.getNoticeOfficeReports)

// Get Total and Individual Stats For Notice Office
/**
 * @swagger
 * /api/noticeOfficeReport/getStats:
 *   get:
 *     summary: Get Total and Individual Stats For Notice Office
 *     tags: [Notice Office Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getStats", noticeOfficeReport.getNoticeOfficeStats)

module.exports = router;