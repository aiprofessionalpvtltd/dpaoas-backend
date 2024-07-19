const express = require('express');
const router = express.Router();
const fileDiaries = require('../controllers/fileDiaries.controller');
const { uploadFile } = require('../common/upload');
const { uploadMultipleFiles } = require('../common/upload');

/**
 * @swagger
 * /api/fileDiary/{id}:
 *   get:
 *     summary: Retrieve All File Diaries
 *     tags: [File Diary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Branch Id
 *         schema:
 *           type: integer
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
router.get('/:id', fileDiaries.retrieveFileDiaries)


module.exports = router