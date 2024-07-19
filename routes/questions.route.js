const express = require('express');
const router = express.Router();
const questions = require('../controllers/questions.controller');
//const { upload } = require("../middleware/questionMulter")
const { questionValidation } = require('../validation/questionValidation')
const { uploadFile } = require('../common/upload');


// Create Question
/**
 * @swagger
 * /api/questions/create:
 *   post:
 *     summary: Create a new Question
 *     tags: [Questions]
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
 *               questionCategory:
 *                 type: string
 *                 description: The category of the question
 *               fkMemberId:
 *                 type: integer
 *                 description: The Id of the member
 *               noticeOfficeDiaryNo:
 *                 type: integer
 *                 description: The diary no of notice diary
 *               noticeOfficeDiaryDate:
 *                 type: string
 *                 description: The date of notice diary
 *               noticeOfficeDiaryTime:
 *                 type: string
 *                 description: The time of notice diary
 *               fkQuestionStatus:
 *                 type: integer
 *                 description: The id of question status
 *               englishText:
 *                 type: string
 *                 description: English Text
 *               urduText:
 *                 type: string
 *                 description: Urdu text
 *               questionSentStatus:
 *                 type: string 
 *               questionImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post("/create", uploadFile("question"), questions.createQuestion)

// Search Question
/**
 * @swagger
 * /api/questions/searchQuestion:
 *   get:
 *     summary: Search Questions
 *     tags: [Questions]
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
 *       - in: query
 *         name: fromSessionNo
 *         schema:
 *           type: integer
 *       - in: query
 *         name: toSessionNo
 *         schema:
 *           type: string
 *       - in: query
 *         name: questionID
 *         schema:
 *           type: integer
 *       - in: query
 *         name: questionDiaryNo
 *         schema:
 *           type: integer
 *       - in: query
 *         name: memberName
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: questionCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: divisions
 *         schema:
 *           type: integer
 *       - in: query
 *         name: noticeOfficeDiaryNo
 *         schema:
 *           type: integer
 *       - in: query
 *         name: groups
 *         schema:
 *           type: integer 
 *       - in: query
 *         name: noticeOfficeDiaryDateFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: noticeOfficeDiaryDateTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: questionStatus
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fileStatus
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/searchQuestion", questions.searchQuestion)

// Get All Questions
/**
 * @swagger
 * /api/questions/all?currentPage=?&pageSize=?:
 *   get:
 *     summary: Get All Questions with respect to currentPage and pageSize
 *     tags: [Questions]
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
router.get("/all", questions.getAllQuestions)

// Get All Question Statuses
/**
* @swagger
* /api/questions/quesStatuses:
*   get:
*     summary: Get All Questions Statuses
*     tags: [Questions]
*     security:
*       - bearerAuth: []
*     responses:
*       '200':
*         description: A successful response
*/
router.get("/quesStatuses", questions.getQuestionStatuses)

// Get All Revived Questions
// /**
//  * @swagger
//  * /api/questions/allRevivedQuestions?currentPage=?&pageSize=?:
//  *   get:
//  *     summary: Get All Revived Questions with respect to currentPage and pageSize
//  *     tags: [Questions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: currentPage
//  *         schema:
//  *           type: integer
//  *         description: Current page number
//  *       - in: query
//  *         name: pageSize
//  *         schema:
//  *           type: integer
//  *         description: Number of items per page
//  *     responses:
//  *       '200':
//  *         description: A successful response
//  */
// router.get("/allRevivedQuestions", questions.getAllReviveQuestions)

// Get Single Question
/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get Single Question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Question ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/:id", questions.getSingleQuestion)

// Update Question
/**
 * @swagger
 * /api/questions/update/{id}:
 *   put:
 *     summary: Updates Question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Question ID
 *         schema:
 *           type: integer
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
 *               questionCategory:
 *                 type: string
 *                 description: The category of the question
 *               fkMemberId:
 *                 type: integer
 *                 description: The Id of the member
 *               questionDiaryNo:
 *                 type: integer
 *                 description: Question Diary Number
 *               noticeOfficeDiaryNo:
 *                 type: integer
 *                 description: The diary no of notice diary
 *               noticeOfficeDiaryDate:
 *                 type: string
 *                 description: The date of notice diary
 *               noticeOfficeDiaryTime:
 *                 type: string
 *                 description: The time of notice diary
 *               fkQuestionStatus:
 *                 type: integer
 *                 description: The id of question status
 *               fkGroupId:
 *                 type: integer
 *                 description: The id of group
 *               fkDivisionId:
 *                 type: integer
 *                 description: The id of division
 *               fileStatus:
 *                 type: string
 *                 description: The Status of File
 *               englishText:
 *                 type: string
 *                 description: English Text
 *               urduText:
 *                 type: string
 *                 description: Urdu text
 *               replyDate:
 *                 type: string
 *                 description: Reply Date
 *               originalText:
 *                 type: string
 *                 description: Original Text Of Question
 *               ammendedText:
 *                 type: string
 *                 description: Ammended Text For Question
 *               replyQuestion:
 *                 type: string 
 *                 description: Reply For Question
 *               questionImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.put("/update/:id", uploadFile("question"), questions.updateQuestion)


// Revive The Question
/**
* @swagger
* /api/questions/reviveQuestion/{id}:
*   post:
*     summary: Create Revive Question
*     tags: [Questions]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: Question ID
*         schema:
*           type: integer
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               fkFromSessionId:
*                 type: integer
*               fkToSessionId:
*                 type: integer
*               fkGroupId:
*                 type: integer
*               fkDivisionId:
*                 type: integer
*               fkQuestionStatus:
*                 type: integer
*     responses:
*       '200':
*         description: A successful response
*/
router.post("/reviveQuestion/:id", questions.reviveQuestion)


// Get Single Revive Question
/**
 * @swagger
 * /api/questions/getReviveQuestion/{id}:
 *   get:
 *     summary: Get Single Revive Question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Question ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get("/getReviveQuestion/:id", questions.getSingleReviveQuestion)

// Defer The Question
/**
* @swagger
* /api/questions/deferQuestion/{id}:
*   post:
*     summary: Create Defer Question
*     tags: [Questions]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: Question ID
*         schema:
*           type: integer
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               fkSessionId:
*                 type: integer
*               deferredDate:
*                 type: string
*               deferredBy:
*                 type: string
*     responses:
*       '200':
*         description: A successful response
*/
router.post("/deferQuestion/:id", questions.deferQuestion)

// Send For Translation
/**
* @swagger
* /api/questions/sendForTranslation/{id}:
*   put:
*     summary: Update "sentForTranslation" to "true" of Question which is sent to Translation Branch 
*     tags: [Questions]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: Question ID
*         schema:
*           type: integer
*     responses:
*       '200':
*         description: A successful response
*/
router.put("/sendForTranslation/:id", questions.sendForTranslation)

// Retrive All Question Histories
/**
* @swagger
* /api/questions/getQuestionHistories/{id}:
*   get:
*     summary: Retrive All Question Histories
*     tags: [Questions]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: Question Id
*         schema:
*           type: integer
*     responses:
*       '200':
*         description: A successful response
*/
router.get('/getQuestionHistories/:id', questions.getQuestionHistories);

// Inactive the Question
/**
* @swagger
* /api/questions/delete/{id}:
*   put:
*     summary: Inactivate/Delete Question
*     tags: [Questions]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: Question ID
*         schema:
*           type: integer
*     responses:
*       '200':
*         description: A successful response
*/
router.put("/delete/:id", questions.deleteQuestion)


module.exports = router;