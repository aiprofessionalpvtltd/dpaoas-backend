const express = require('express');
const router = express.Router();
const fileDiaries = require('../controllers/fileDiaries.controller');
const { uploadFile } = require('../common/upload');
const { uploadMultipleFiles } = require('../common/upload');

/**
 * @swagger
 * /api/fileDiary/:
 *   get:
 *     summary: Retrieve All File Diaries
 *     tags: [File Diary]
 *     parameters:
 *       - in: query
 *         name: currentPage
 *         required: true
 *         description: currentPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         required: true
 *         description: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/', fileDiaries.retrieveFileDiaries)


module.exports = router