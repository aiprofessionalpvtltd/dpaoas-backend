'use strict'

// Get dependencies
const express = require('express')
const router = express.Router()
const controller = require('../controllers/senate-public.controller')

/**
 * @swagger
 * /api/senator/public/hansard:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Hansard
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Hansard
 */
router.get('/hansard', controller.getHansardData)

/**
 * @swagger
 * /api/senator/public/resolutions:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all resolutions Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all resolutions Data
 */
router.get('/resolutions', controller.getResolutionsData)

/**
 * @swagger
 * /api/senator/public/bills:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Bills Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Bills Data
 */
router.get('/bills', controller.getBillsData)

/**
 * @swagger
 * /api/senator/public/ordinances:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Ordinances Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Ordinances Data
 */
router.get('/ordinances', controller.getOrdinancesData)

/**
 * @swagger
 * /api/senator/public/rulings:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Rulings Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Rulings Data
 */
router.get('/rulings', controller.getRulingsData)

/**
 * @swagger
 * /api/senator/public/acts:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Acts Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Acts Data
 */
router.get('/acts', controller.getActsData)

/**
 * @swagger
 * /api/senator/public/press-releases:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Press Releases Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Press Releases Data
 */
router.get('/press-releases', controller.getPressReleasesData)

/**
 * @swagger
 * /api/senator/public/current-members:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Current Members Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Current Members Data
 */
router.get('/current-members', controller.getCurrentMembersData)

/**
 * @swagger
 * /api/senator/public/petition/cnic/{cnic}/refNumber/{refNumber}:
 *   get:
 *     tags:
 *       - Senator Public App
 *     parameters:
 *       - in: path
 *         name: cnic
 *         example: 17102-1167404-9
 *         schema:
 *           type: string
 *         required: true
 *         description: cnic to get specific public petition
 *       - in: path
 *         name: refNumber
 *         example: PP-5020
 *         schema:
 *           type: string
 *         required: true
 *         description: refNumber to get specific public petition
 *     description: get all public petition data by ref_no, CNIC
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all public petition data by ref_no, CNIC
 */
router.get(
  '/petition/cnic/:cnic/refNumber/:refNumber',
  controller.getPublicPetition,
)

/**
 * @swagger
 * /api/senator/public/all-members:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Current Members Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Current Members Data
 */
router.get(
  '/all-members',
  controller.getAllMembers,
)

/**
 * @swagger
 * /api/senator/public/petition:
 *   post:
 *     tags:
 *       - Senator Public App
 *     description: add public petition data
 *     requestBody:
 *          description: request body contains name, cnic, email,telephone,mobileNo,address,relevantArea,subject,message,note,check2,fileName,status,ip,subject2,city,action_path
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                      name:
 *                          type: string
 *                          example: Education
 *                      cnic:
 *                          type: string
 *                          example: 123456789
 *                      email:
 *                          type: string
 *                          example: testing
 *                      telephone:
 *                          type: string
 *                          example: 1234567890
 *                      mobileNo:
 *                          type: string
 *                          example: 1234567890
 *                      address:
 *                          type: string
 *                          example: Senate
 *                      relevantArea:
 *                          type: string
 *                          example: Pakistan
 *                      subject:
 *                          type: string
 *                          example: subject
 *                      message:
 *                          type: string
 *                          example: Islamabad
 *                      note:
 *                          type: string
 *                          example: 03156320620
 *                      check2:
 *                          type: string
 *                          example: ADMIN
 *                      fileName:
 *                          type: binary
 *                          example: test.png
 *                      status:
 *                          type: string
 *                          example: true
 *                      ip:
 *                          type: string
 *                          example: 1-234-5
 *                      subject2:
 *                          type: string
 *                          example: subject
 *                      city:
 *                          type: string
 *                          example: Islamabad
 *                      action_path:
 *                          type: binary
 *                          example: test.png
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: add public petition data
 */
router.post('/petition', controller.addPublicPetition)

/**
 * @swagger
 * /api/senator/public/update-password:
 *   put:
 *     tags:
 *       - Senator Public App
 *     description: Update password for specific user email after otp verification
 *     requestBody:
 *          description: request body contains email, new password
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *                      password:
 *                          type: string
 *                          example: 123456789
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated password for specific user email
 */
router.put('/update-password', controller.updatePassword)

/**
 * @swagger
 * /api/senator/public/public-notification:
 *   post:
 *     tags:
 *       - Senator Public App
 *     description: add public notification data
 *     requestBody:
 *          description: request body contains notification_time, title, description
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                      title:
 *                          type: string
 *                          example: Education
 *                      notification_time:
 *                          type: string
 *                          example: 24-11-2001
 *                      description:
 *                          type: string
 *                          example: testing
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: add public Notification data
 */
router.post('/public-notification', controller.addPublicNotification)

/**
 * @swagger
 * /api/senator/public/public-notification:
 *   get:
 *     tags:
 *       - Senator Public App
 *     description: get all Public notification Data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: get all Public notification Data
 */
router.get('/public-notification', controller.getPublicNotification)

module.exports = router
