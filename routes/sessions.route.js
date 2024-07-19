const express = require('express');
const router = express.Router();
const sessions = require('../controllers/sessions.controller');

// Create Session
/**
 * @swagger
 * /api/sessions/create:
 *   post:
 *     summary: Create a new Session
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionName:
 *                 type: integer
 *               calledBy:
 *                 type: string
 *               isJointSession:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               legislationDiaryNo:
 *                 type: integer
 *               legislationDiaryDate:
 *                 type: string
 *               businessStatus:
 *                 type: string
 *               businessSessions:
 *                 type: array
 *                 items:
 *                   type: integer
 *               fkParliamentaryYearId:
 *                 type: integer
 *               isQuoraumAdjourned:
 *                 type: boolean
 *               summonNoticeDate:
 *                 type: string
 *               summonNoticeTime:
 *                 type: string
 *               jointSessionPurpose:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", sessions.createSession)

// Get All Sessions
 /**
 * @swagger
 * /api/sessions/:
 *   get:
 *     summary: Get All Sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currentPage
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
router.get("/", sessions.geAllSessions)

// Get Single Session
/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get Single Session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", sessions.getSingleSession)

// Update Session
/**
 * @swagger
 * /api/sessions/update/{id}:
 *   put:
 *     summary: Get Updated Session
 *     tags: [Sessions]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Session Id
 *        schema:
 *          type: integer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionName:
 *                 type: integer
 *               calledBy:
 *                 type: string
 *               isJointSession:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               legislationDiaryNo:
 *                 type: integer
 *               legislationDiaryDate:
 *                 type: string
 *               businessStatus:
 *                 type: string
 *               businessSessions:
 *                 type: array
 *                 items:
 *                   type: integer
 *               fkParliamentaryYearId:
 *                 type: integer
 *               isQuoraumAdjourned:
 *                 type: boolean
 *               summonNoticeDate:
 *                 type: string
 *               summonNoticeTime:
 *                 type: string
 *               jointSessionPurpose:
 *                 type: string
 *               sessionStatus:
 *                 type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", sessions.updateSession)

// Inactive/Delete Session
/**
 * @swagger
 * /api/sessions/delete/{id}:
 *   delete:
 *     summary: Delete Session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete("/delete/:id", sessions.deleteSession)

module.exports = router;