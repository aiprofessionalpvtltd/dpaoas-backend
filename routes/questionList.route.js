const express = require('express');
const router = express.Router();
const questionList = require('../controllers/questionList.controller');

// Generate A New Question List
/**
 * @swagger
 * /api/questionList/generateQuestionList:
 *   post:
 *     summary: Generate A New Question List
 *     tags: [Question Lists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fkSessionId:
 *                 type: integer
 *               questionCategory:
 *                 type: string
 *               fkGroupId:
 *                 type: integer
 *               startListNo:
 *                  type: integer
 *               listName: 
 *                  type: string
 *               houseLayDate:
 *                  type: string
 *               defferedQuestions:
 *                  type: boolean
 *               fkUserId:
 *                  type: integer
 *             required:
 *               - startListNo
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/generateQuestionList', questionList.generateQuestionList)

// Save Question List
/**
 * @swagger
 * /api/questionList/saveQuestionList:
 *   post:
 *     summary: Save Question List
 *     tags: [Question Lists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionList:
 *                 type: object
 *                 properties:
 *                   fkSessionId:
 *                     type: integer
 *                   questionCategory:
 *                     type: string
 *                   fkGroupId:
 *                     type: integer
 *                   startListNo:
 *                     type: integer
 *                   listName:
 *                     type: string
 *                   houseLayDate:
 *                     type: string
 *                   defferedQuestions:
 *                     type: boolean
 *                   fkUserId:
 *                     type: integer
 *                   questionIds:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *               required:
 *                 - fkSessionId
 *                 - questionCategory
 *                 - fkGroupId
 *                 - startListNo
 *                 - listName
 *                 - houseLayDate
 *                 - defferedQuestions
 *                 - fkUserId
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/saveQuestionList', questionList.saveQuestionList)

// Get Single Question List
/**
 * @swagger
 * /api/questionList/{id}:
 *   get:
 *     summary: Get Single Question List
 *     tags: [Question Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: QuestionList Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/:id', questionList.getSingleQuestionList)

// Get Question List By Session Id
/**
 * @swagger
 * /api/questionList/getBySessionId/{id}:
 *   get:
 *     summary: Get Question Lists By Session Id
 *     tags: [Question Lists]
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
router.get('/getBySessionId/:id', questionList.getQuestionListBySessionId)

// Delete Question List
/**
 * @swagger
 * /api/questionList/deleteQuestionList/{id}:
 *   delete:
 *     summary: Delete Single Question List
 *     tags: [Question Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: QuestionList Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete('/deleteQuestionList/:id', questionList.deleteQuestionList)

// Generate Supplementary List
/**
 * @swagger
 * /api/questionList/generateSupplementaryList/{id}:
 *   post:
 *     summary: Generate a new Supplementary List of Question List
 *     tags: [Question Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: QuestionList Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listName:
 *                 type: string
 *               houseLayDate:
 *                 type: string
 *               fkUserId:
 *                  type: integer
 *             required:
 *               - listName
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/generateSupplementaryList/:id', questionList.generateSupplementaryList)

// Save Supplementary List
/**
 * @swagger
 * /api/questionList/saveSupplementaryList/{id}:
 *   post:
 *     summary: Save Question Supplementary List
 *     tags: [Question Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: QuestionList Id
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplementaryList:
 *                 type: object
 *                 properties:
 *                   listName:
 *                     type: string
 *                   houseLayDate:
 *                     type: string
 *                   fkUserId:
 *                     type: integer
 *                   supplementaryQuestionsIds:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *               required:
 *                 - fkQuestionListId
 *                 - listName
 *                 - houseLayDate
 *                 - fkUserId
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.post('/saveSupplementaryList/:id', questionList.saveSupplementaryList)

// Get Supplementary List By Question List Id
/**
 * @swagger
 * /api/questionList/getByQuestionListId/{id}:
 *   get:
 *     summary: Get Supplementary Lists By Question List Id
 *     tags: [Question Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: QuestionList Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/getByQuestionListId/:id', questionList.getSupplementaryList)

// Get Single Supplementary List
/**
 * @swagger
 * /api/questionList/getBySupplementaryListId/{id}:
 *   get:
 *     summary: Get Single Supplementary List
 *     tags: [Question Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: SupplementaryList Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.get('/getBySupplementaryListId/:id', questionList.getSingleSupplementaryList)

// Delete Supplementary List
/**
 * @swagger
 * /api/questionList/deleteSupplementaryList/{id}:
 *   delete:
 *     summary: Delete Single Supplementary List
 *     tags: [Question Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: SupplementaryList Id
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A successful response
 */
router.delete('/deleteSupplementaryList/:id', questionList.deleteSupplementaryList)

module.exports = router;
