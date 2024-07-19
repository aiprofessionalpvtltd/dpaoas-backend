/* eslint-disable spellcheck/spell-checker */
'use strict'

// Get dependencies
const express = require('express')
const router = express.Router()
const {
  signUpValidation,
  attendeeSignUpValidation,
  loginValidation,
  senatorSignUpValidation,
} = require('../middleware/validation/auth.validation')
const { uploadFile } = require('../helper/upload-file')

const controller = require('../controllers/auth.controller')

/**
 * @swagger
 * /api/auth/user-login:
 *   post:
 *     tags:
 *       - Auth
 *     description: login user
 *     requestBody:
 *          description: user login
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: admin@admin.com
 *                      password:
 *                          type: string
 *                          example: 123456789
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User is loggedIn and its session is created
 */
router.post('/user-login', loginValidation, controller.login)

/**
 * @swagger
 * /api/auth/user-signup:
 *   post:
 *     tags:
 *       - Auth
 *     description: signup user
 *     requestBody:
 *          description: contains email,password and signup_provider
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                      - first_name
 *                      - last_name
 *                      - role
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *                      first_name:
 *                          type: string
 *                          example: test
 *                      last_name:
 *                          type: string
 *                          example: test
 *                      role:
 *                          type: string
 *                          example: test
 *                      password:
 *                          type: string
 *                          example: 123456789
 *                      cnic:
 *                          type: string
 *                          example: 123-4567-890
 *                      phone:
 *                          type: string
 *                          example: 03101234567
 *                      designation:
 *                          type: string
 *                          example: test
 *                      department:
 *                          type: string
 *                          example: test
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: User is created and its session is created
 */
router.post('/user-signup', signUpValidation, controller.signUp)

/**
 * @swagger
 * /api/auth/attendee-login:
 *   post:
 *     tags:
 *       - Auth
 *     description: Login Attendee
 *     requestBody:
 *          description: attendee login
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test.test@test.com
 *                      password:
 *                          type: string
 *                          example: 123456789
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User is loggedIn and its session is created
 */
router.post('/attendee-login', loginValidation, controller.attendeeLogin)

/**
 * @swagger
 * /api/auth/attendee-signup:
 *   post:
 *     tags:
 *       - Auth
 *     description: signup attendee
 *     requestBody:
 *          description: contains email,password,first_name,cnic
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                      - first_name
 *                      - cnic
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *                      first_name:
 *                          type: string
 *                          example: test
 *                      middle_name:
 *                          type: string
 *                          example: test
 *                      last_name:
 *                          type: string
 *                          example: test
 *                      password:
 *                          type: string
 *                          example: 123456789
 *                      cnic:
 *                          type: string
 *                          example: 123-4567-890
 *                      designation:
 *                          type: string
 *                          example: test
 *                      passport_no:
 *                          type: string
 *                          example: test
 *                      company:
 *                          type: string
 *                          example: test
 *                      phone:
 *                          type: string
 *                          example: test
 *                      country:
 *                          type: string
 *                          example: test
 *                      event_id:
 *                          type: integer
 *                          example: 2
 *                      nationality:
 *                          type: string
 *                          example: test
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Attendee is created and its session is created
 */
router.post(
  '/attendee-signup',
  attendeeSignUpValidation,
  controller.attendeeSignUp,
)

/**
 * @swagger
 * /api/auth/senator-login:
 *   post:
 *     tags:
 *       - Auth
 *     description: Login senator
 *     requestBody:
 *          description: senator login
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: irfan
 *                      password:
 *                          type: string
 *                          example: abc123
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User is loggedIn and its session is created
 */
router.post('/senator-login', controller.senatorLogin)

/**
 * @swagger
 * /api/auth/senator-signup:
 *   post:
 *     tags:
 *       - Auth
 *     description: signup senator
 *     requestBody:
 *          description: contains email,password,first_name,cnic
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                      - first_name
 *                      - last_name
 *                      - cnic
 *                      - username
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *                      first_name:
 *                          type: string
 *                          example: test
 *                      last_name:
 *                          type: string
 *                          example: test
 *                      username:
 *                          type: string
 *                          example: username
 *                      password:
 *                          type: string
 *                          example: 123456789
 *                      cnic:
 *                          type: string
 *                          example: 123-4567-890
 *                      designation:
 *                          type: string
 *                          example: test
 *                      phone:
 *                          type: string
 *                          example: test
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: senator is created and its session is created
 */
router.post(
  '/senator-signup',
  senatorSignUpValidation,
  controller.senatorSignUp,
)

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     tags:
 *       - Auth
 *     description: Send OTP to phone number and email
 *     requestBody:
 *          description: contains email
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Token is sent to specific phone and email
 */
router.post('/send-otp', controller.sendOTP)

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     tags:
 *       - Auth
 *     description: verify token for SIGNUP user and senator
 *     requestBody:
 *          description: contains token
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - emailToken
 *                      - emailSecretKey
 *                      - phoneToken
 *                      - phoneSecretKey
 *                  properties:
 *                      emailSecretKey:
 *                          type: string
 *                          example: 12345at
 *                      emailToken:
 *                          type: string
 *                          example: 12345
 *                      phoneSecretKey:
 *                          type: string
 *                          example: 12345at
 *                      phoneToken:
 *                          type: string
 *                          example: 12345
 *                      action:
 *                          type: string
 *                          example: senator_login
 *                      email:
 *                          type: string
 *                          example: 12345
 *                      password:
 *                          type: string
 *                          example: 12345
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Token is verified/not verified
 */
router.post('/verify-token', controller.verifyToken)

/**
 * @swagger
 * /api/auth/verify-senator:
 *   post:
 *     tags:
 *       - Auth
 *     description: Verify Email for new senator signup
 *     requestBody:
 *          description: contains email
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: irfanulhaq@senate.gov.pk
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Token is sent to specific email and specific phone
 */
router.post('/verify-senator', controller.verifySenator)

/**
 * @swagger
 * /api/auth/public-user-login:
 *   post:
 *     tags:
 *       - Auth
 *     description: Login public user
 *     requestBody:
 *          description: public user login
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test
 *                      password:
 *                          type: string
 *                          example: abc123
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User is loggedIn and its session is created
 */
router.post('/public-user-login', controller.publicUserLogin)

/**
 * @swagger
 * /api/auth/public-user-signup:
 *   post:
 *     tags:
 *       - Auth
 *     description: signup public user
 *     requestBody:
 *          description: contains file,email,password,first_name,cnic
 *          content:
 *             multipart/form-data:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                      - password
 *                      - first_name
 *                      - last_name
 *                      - cnic
 *                      - username
 *                  properties:
 *                      file:
 *                        required: true
 *                        type: string
 *                        format: base64
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *                      first_name:
 *                          type: string
 *                          example: test
 *                      last_name:
 *                          type: string
 *                          example: test
 *                      username:
 *                          type: string
 *                          example: username
 *                      password:
 *                          type: string
 *                          example: 123456789
 *                      cnic:
 *                          type: string
 *                          example: 123-4567-890
 *                      designation:
 *                          type: string
 *                          example: test
 *                      phone:
 *                          type: string
 *                          example: test
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: public user is created and its session is created
 */
router.post(
  '/public-user-signup',
  uploadFile('profile'),
  controller.publicUserSignup,
)

/**
 * @swagger
 * /api/auth/verify-public-user:
 *   post:
 *     tags:
 *       - Auth
 *     description: Verify Email for new public user
 *     requestBody:
 *          description: contains email, phone
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *                      phone:
 *                          type: string
 *                          example: 123456789
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Token is sent to specific email
 */
router.post('/verify-public-user', controller.verifyPublicUser)

/**
 * @swagger
 * /api/auth/public-user-forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     description: Forgot Password otp send to provided Email
 *     requestBody:
 *          description: contains email
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Token is sent to specific email
 */
router.post('/public-user-forgot-password', controller.publicUserForgotPassword)

/**
 * @swagger
 * /api/auth/senator-forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     description: Forgot Password otp send to provided Email
 *     requestBody:
 *          description: contains email
 *          content:
 *            application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                      - email
 *                  properties:
 *                      email:
 *                          type: string
 *                          example: test@test.com
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Token is sent to specific email
 */
router.post('/senator-forgot-password', controller.senatorForgotPassword)

module.exports = router
