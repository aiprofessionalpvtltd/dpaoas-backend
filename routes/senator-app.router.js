'use strict'

// Get dependencies
const express = require('express')
const router = express.Router()
const { authenticateUser } = require('../middleware/authentication')
const controller = require('../controllers/senator-app.controller')

/**
 * @swagger
 * /api/senator/news:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all Latest News
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Latest News
 */
router.get('/news', authenticateUser, controller.getLatestNews)

/**
 * @swagger
 * /api/senator/legislative:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all Legislative Business
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Legislative Business
 */
router.get('/legislative', authenticateUser, controller.getLegislative)

/**
 * @swagger
 * /api/senator/non-legislative:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all Senator
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Senator
 */
router.get('/non-legislative', authenticateUser, controller.getNonLegislative)

/**
 * @swagger
 * /api/senator/committee-notices/member/{memberId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: integer
 *         required: true
 *         description: memberId to get specific member committee-notices Records.
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *         required: true
 *         description: Daily or Monthly or Weekly to get specific member committee-notices Records by Time Period.
 *     description: get all committee notices by memberId
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all committee notices by memberId
 */
router.get(
  '/committee-notices/member/:memberId',
  authenticateUser,
  controller.getCommitteeMeetingsByMember,
)

/**
 * @swagger
 * /api/senator/committee-reports/member/{memberId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: integer
 *         required: true
 *         description: memberId to get specific member committee reports Records.
 *     description: get all committee reports by memberId
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all committee reports by memberId
 */
router.get(
  '/committee-reports/member/:memberId',
  authenticateUser,
  controller.getCommitteeReportsByMember,
)

/**
 * @swagger
 * /api/senator/committee-notices:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     parameters:
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *         required: true
 *         description: Daily or Monthly or Weekly to get Records by Time Period.
 *     description: get all committee notices
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all committee notices
 */
router.get('/committee-notices', controller.getCommitteeMeetings)

/**
 * @swagger
 * /api/senator/committee-reports:
 *   get:
 *     tags:
 *       - Senator Mobile App
 *     description: get all committee reports
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all committee reports
 */
router.get('/committee-reports', controller.getCommitteeReports)

/**
 * @swagger
 * /api/senator/questions-answers:
 *   get:
 *     tags:
 *       - Senator Mobile App
 *     description: get all questions/answers
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all questions/answers
 */
router.get('/questions-answers', controller.getQuestionsAnswers)

/**
 * @swagger
 * /api/senator/order-of-day:
 *   get:
 *     tags:
 *       - Senator Mobile App
 *     description: get order of day
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get order of day
 */
router.get('/order-of-day', controller.getOrderOfDay)

/**
 * @swagger
 * /api/senator/speech-on-demand:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all speech on demand
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all speech on demand
 */
router.get('/speech-on-demand', authenticateUser, controller.getSpeechOnDemand)

/**
 * @swagger
 * /api/senator/speech-on-demand:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: create new speech on demand
 *     requestBody:
 *          description: contains name,session_no, justification,request_date, number,delivery_on
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                      name:
 *                          type: string
 *                          example: name
 *                      date:
 *                          type: Date
 *                          example: 2022-12-12
 *                      session_no:
 *                          type: string
 *                          example: session_no
 *                      justification:
 *                          type: string
 *                          example: justification
 *                      request_date:
 *                          type: Date
 *                          example: 2022-12-12
 *                      whatsapp_number:
 *                          type: string
 *                          example: WhatsApp number
 *                      delivery_on:
 *                          type: string
 *                          example: whatsapp,dvd,other_tools
 *                      is_certified:
 *                          type: boolean
 *                          example: 1
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: new speech on demand created
 */
router.post('/speech-on-demand', authenticateUser, controller.addSpeechOnDemand)

/**
 * @swagger
 * /api/senator/session-agenda:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all session agenda
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all session agenda
 */
router.get('/session-agenda', authenticateUser, controller.getSessionAgenda)

/**
 * @swagger
 * /api/senator/publications:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all Senate publications
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Senate publications
 */
router.get('/publications', authenticateUser, controller.getSenatePublications)

/**
 * @swagger
 * /api/senator/press-release/{memberId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all Senate press release
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: integer
 *         required: true
 *         description: memberId to get specific member friendship Records.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Senate  press release
 */
router.get(
  '/press-release/:memberId',
  authenticateUser,
  controller.getSenatePressRelease,
)

/**
 * @swagger
 * /api/senator/parliamentary-friendship:
 *   get:
 *     tags:
 *       - Senator Mobile App
 *     description: get all Parliamentary Friendship Group
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Parliamentary Friendship Group
 */
router.get('/parliamentary-friendship', controller.getParliamentaryFriendship)

/**
 * @swagger
 * /api/senator/parliamentary-friendship/member/{memberId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all Parliamentary Friendship Group by memberId
 *     parameters:
 *       - in: path
 *         name: memberId
 *         schema:
 *           type: integer
 *         required: true
 *         description: memberId to get specific member friendship Records.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Parliamentary Friendship Group by memberId
 */
router.get(
  '/parliamentary-friendship/member/:memberId',
  authenticateUser,
  controller.getParliamentaryFriendshipByMember,
)

/**
 * @swagger
 * /api/senator/friendship-members/{countryId}:
 *   get:
 *     tags:
 *       - Senator Mobile App
 *     description: get all Friendship Members by countryId
 *     parameters:
 *       - in: path
 *         name: countryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: countryId to get specific members Records.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Friendship Members by countryId
 */
router.get('/friendship-members/:countryId', controller.getMembersByCountryId)

/**
 * @swagger
 * /api/senator/session-numbers:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Senator Mobile App
 *     description: get all session numbers
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all session numbers
 */
router.get('/session-numbers', authenticateUser, controller.getSessionNumbers)

module.exports = router
