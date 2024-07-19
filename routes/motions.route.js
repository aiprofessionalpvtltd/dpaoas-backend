const express = require('express');
const router = express.Router();
const motionController = require('../controllers/motion.controller');
const {
    motionRequestValidation, motionupdateValidation
} = require('../validation/motionValidation');
const { uploadFile } = require('../common/upload');


router.get('/motionStatuses', motionController.getMotionStatuses);


/**
 * @swagger
 * /api/motion/create:
 *   post:
 *     summary: Create a New Motion
 *     tags: [Motions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionId:
 *                 type: integer
 *                 description: The Id of the session
 *               fileNumber:
 *                 type: integer
 *                 description: The file number
 *               motionType:
 *                 type: string
 *                 description: Type of motion
 *               motionWeek:
 *                 type: string
 *                 description: Motion Week
 *               noticeOfficeDiaryDate:
 *                 type: string
 *                 description: The date of notice diary
 *               noticeOfficeDiaryTime:
 *                 type: string
 *                 description: The time of notice diary
 *               noticeOfficeDiaryNo:
 *                 type: integer
 *                 description: The diary number
 *               moverIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of integers representing mover IDs
 *               ministryIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of integers representing ministry IDs
 *               businessType:
 *                 type: string
 *                 description: Business Type "Motion"
 *               englishText:
 *                 type: string
 *                 description: English text
 *               urduText:
 *                 type: string
 *                 description: Urdu text
 *               fkMotionStatus:
 *                 type: string
 *                 description: Motion Status
 *               dateOfMovingHouse:
 *                 type: string
 *                 description: Date of moving to house
 *               dateOfDiscussion:
 *                 type: string
 *                 description: Date of discussion
 *               dateOfReferringToSc:
 *                 type: string
 *                 description: Date of Referring to SC
 *               note:
 *                 type: string
 *                 description: Note 
 *               sentForTranslation:
 *                 type: boolean
 *               isTranslated:
 *                 type: boolean  
 *               motionSentStatus:
 *                 type: string 
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/create', uploadFile('motion'), motionController.createMotion);


/**
 * @swagger
 * /api/motion/all?page=?&pageSize=?&noticeStartRange=?&noticeEndRange=?:
 *   get:
 *     summary: Get And Search Motions
 *     tags: [Motions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fileNumber
 *         schema:
 *           type: integer
 *       - in: query
 *         name: motionWeek
 *         schema:
 *           type: string
 *       - in: query
 *         name: motionType
 *         schema:
 *           type: string
 *       - in: query
 *         name: motionId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: englishText
 *         schema:
 *           type: string
 *       - in: query
 *         name: fkMemberId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fkMinistryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sessionStartRange
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sessionEndRange
 *         schema:
 *           type: integer
 *       - in: query
 *         name: noticeStartRange
 *         schema:
 *           type: string
 *       - in: query
 *         name: noticeStartRange
 *         schema:
 *           type: string
 *       - in: query
 *         name: noticeEndRange
 *         schema:
 *           type: integer 
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/all', motionController.getAllMotions);

/**
 * @swagger
 * /api/motion/{id}:
 *   put:
 *     summary: Update Motion
 *     tags: [Motions]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *           description: Motion Id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionId:
 *                 type: integer
 *                 description: The Id of the session
 *               fileNumber:
 *                 type: integer
 *                 description: The file number
 *               motionType:
 *                 type: string
 *                 description: Type of motion
 *               motionWeek:
 *                 type: string
 *                 description: Motion Week
 *               noticeOfficeDiaryDate:
 *                 type: string
 *                 description: The date of notice diary
 *               noticeOfficeDiaryTime:
 *                 type: string
 *                 description: The time of notice diary
 *               noticeOfficeDiaryNo:
 *                 type: integer
 *                 description: The diary number
 *               moverIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of integers representing mover IDs
 *               ministryIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of integers representing ministry IDs
 *               businessType:
 *                 type: string
 *                 description: Business Type "Motion"
 *               englishText:
 *                 type: string
 *                 description: English text
 *               urduText:
 *                 type: string
 *                 description: Urdu text
 *               fkMotionStatus:
 *                 type: string
 *                 description: Motion Status
 *               dateOfMovingHouse:
 *                 type: string
 *                 description: Date of moving to house
 *               dateOfDiscussion:
 *                 type: string
 *                 description: Date of discussion
 *               dateOfReferringToSc:
 *                 type: string
 *                 description: Date of Referring to SC
 *               note:
 *                 type: string
 *                 description: Note 
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Attachment
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put('/:id', uploadFile('motion'), motionController.updateMotion);

/**
 * @swagger
 * /api/motion/sendForTranslation/{id}:
 *   put:
 *     summary: Update "sentForTranslation" to "true" of Motion
 *     tags: [Motions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Motion Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put('/sendForTranslation/:id', motionController.sendForTranslation);

/**
 * @swagger
 * /api/motion/ministries:
 *   get:
 *     summary: Get All Ministries
 *     tags: [Ministries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/ministries', motionController.getMinistries);

/**
 * @swagger
 * /api/motion/{id}:
 *   get:
 *     summary: Get Motion By Id
 *     tags: [Motions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Motion Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/:id', motionController.getMotionById);


/**
* @swagger
* /api/motion/motionStatuses:
*   get:
*     summary: Get All Motion Statuses
*     tags: [Motions]
*     security:
*       - bearerAuth: []
*     responses:
*       '200':
*         description: A successful response
*/
router.get('/motionStatuses', motionController.getMotionStatuses);


module.exports = router;
