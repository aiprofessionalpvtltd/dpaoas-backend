const AuthService = require('../services/auth.service')
const { validationErrorResponse } = require('../common/validation-responses.js')
const { validationResult } = require('express-validator')
const logger = require('../common/winston');

const config = require('../config/jwt.js')
const jwt = require('jsonwebtoken')
const AuthController = {
  login: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    winston.info(`AuthController: login body ${JSON.stringify(body)}`)
    const service = new AuthService(db, winston)
    try {
      const user = await service.login(body.email, body.password)
      const token = jwt.sign({ ...user }, config.jwt.secretKey, {
        expiresIn: config.jwt.expiration,
      })
      return res
        .status(200)
        .setHeader('Authorization', 'Bearer ' + token)
        .send({
          success: true,
          message: `User login successfully`,
          user,
          token,
        })
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: error.message,
      })
    }
  },
  signUp: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    winston.info(`AuthController: signUp body ${JSON.stringify(body)}`)
    const service = new AuthService(db, winston)
    try {
      const newUser = await service.signup(body)
      const token = jwt.sign(newUser, config.jwt.secretKey, {
        expiresIn: config.jwt.expiration,
      })

      return res
        .status(200)
        .setHeader('Authorization', 'Bearer ' + token)
        .send({
          success: true,
          message: `User created successfully`,
          user: newUser,
          token,
        })
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: error.message,
      })
    }
  },
  attendeeLogin: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    winston.info(`AuthController: attendeeLogin body ${JSON.stringify(body)}`)
    const service = new AuthService(db, winston)
    try {
      const attendee = await service.attendeeLogin(body.email, body.password)
      const token = jwt.sign(
        { ...attendee, role: 'attendee' },
        config.jwt.secretKey,
        {
          expiresIn: config.jwt.expiration,
        },
      )

      return res
        .status(200)
        .setHeader('Authorization', 'Bearer ' + token)
        .send({
          success: true,
          message: `Attendee login successfully`,
          attendee: attendee,
          token,
        })
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: error.message,
      })
    }
  },
  attendeeSignUp: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    winston.info(`AuthController: attendeeSignUp body ${JSON.stringify(body)}`)
    if (!body.event_id) {
      return validationErrorResponse(res)
    }
    const service = new AuthService(db, winston)
    try {
      const newAttendee = await service.attendeeSignup(body)
      const token = jwt.sign(
        { ...newAttendee, role: 'attendee' },
        config.jwt.secretKey,
        {
          expiresIn: config.jwt.expiration,
        },
      )
      return res
        .status(200)
        .setHeader('Authorization', 'Bearer ' + token)
        .send({
          success: true,
          message: `Attendee created successfully`,
          attendee: newAttendee,
          token,
        })
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: error.message,
      })
    }
  },
  senatorLogin: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    logger.info(`AuthController: senatorLogin body ${JSON.stringify(body)}`)
    const service = new AuthService(db, winston)
    try {
      const result = await service.senatorLogin(body.email, body.password)
      return res.status(200).send({
        success: true,
        message: `Email and Password matched successfully. Kindly verify OTP`,
        data: result,
      })
    } catch (error) {
      return res.status(error.code ? error.code : 404).send({
        success: false,
        message: error.message,
      })
    }
  },
  senatorSignUp: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    winston.info(`AuthController: senatorSignUp body ${JSON.stringify(body)}`)
    const service = new AuthService(db, winston)
    try {
      const newSenator = await service.senatorSignup(body)
      return senatorSignupToken(res, newSenator)
    } catch (error) {
      return res.status(error.code).send({
        success: false,
        message: error.message,
      })
    }
  },
  verifyToken: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    const {
      emailToken,
      emailSecretKey,
      phoneToken,
      phoneSecretKey,
      action,
      ...data
    } = body
    logger.info(
      `AuthController: verifyToken called body: ${JSON.stringify(
        body,
      )}, data: ${JSON.stringify(data)}`,
    )
    const authService = new AuthService(db, logger)
    logger.info(`verifyToken: AuthService, ${authService}`)
    try {
      const result = await authService.verifyToken(
        emailToken,
        emailSecretKey,
        phoneToken,
        phoneSecretKey,
        action,
        data,
      )
      console.log("result---->> " + result)
      if (result) {
        
        if (action === 'senator_login') return senatorLoginToken(res, result)
        return res.status(200).send({
          success: result.emailVerify && result.phoneVerify,
          message: result.message,
          data: {
            isEmailVerify: result.emailVerify,
            isPhoneVerify: result.phoneVerify,
          },
        })
      } else
        return res.status(403).send({
          success: false,
          message: `Code is Invalid`,
          data: { isEmailVerify: false, isPhoneVerify: false },
        })
    } catch (error) {
      logger.info(`AuthController: verifyToken Error occurred on ${error}`)
      return res.status(402).send({
        success: false,
        message: error.message,
      })
    }
  },
  verifySenator: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    logger.info(
      `AuthController: verifySenator called body: ${JSON.stringify(body)}`,
    )
    const service = new AuthService(db, winston)
    try {
      const result = await service.verifySenator(body)
      return res.status(200).send({
        success: true,
        message: `Otp send to Phone or Email`,
        data: result,
      })
    } catch (error) {
      return res.status(error.code).send({
        success: false,
        message: error.message || 'Kindly enter your official email',
      })
    }
  },
  verifyPublicUser: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    logger.info(
      `AuthController: verifyPublicUser called body: ${JSON.stringify(body)}`,
    )
    const service = new AuthService(db, logger)
    try {
      const result = await service.verifyPublicUser(body)
      //console.log("reesss---", result);
      return res.status(200).send({
        success: true,
        message: `You are not registered please create account`,
        data: result,
      })
    } catch (error) {
      return res.status(error.code).send({
        success: false,
        message: error.message,
      })
    }
  },

  publicUserForgotPassword: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    logger.info(
      `AuthController: publicUserForgotPassword called body: ${JSON.stringify(
        body,
      )}`,
    )
    const service = new AuthService(db, logger)
    try {
      const result = await service.publicUserForgotPassword(body)
      return res.status(200).send({
        success: true,
        message: `Forgot Password Otp send to your Email`,
        data: result,
      })
    } catch (error) {
      return res.status(error.code).send({
        success: false,
        message: error.message,
      })
    }
  },
  sendOTP: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    winston.info(`AuthController: sendOTP called body: ${JSON.stringify(body)}`)
    const service = new AuthService(db, winston)
    try {
      const result = await service.sendOTP(body)
      return res.status(200).send({
        success: true,
        message: `Otp send to Phone or Email`,
        data: result,
      })
    } catch (error) {
      return res.status(error.code).send({
        success: false,
        message: error.message,
      })
    }
  },

  senatorForgotPassword: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    logger.info(
      `AuthController: senatorForgotPassword called body: ${JSON.stringify(
        body,
      )}`,
    )
    const service = new AuthService(db, winston)
    try {
      const result = await service.senatorForgotPassword(body)
      return res.status(200).send({
        success: true,
        message: `Forgot Password OTP send to your Email`,
        data: result,
      })
    } catch (error) {
      return res.status(error.code).send({
        success: false,
        message: error.message,
      })
    }
  },
  publicUserLogin: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body } = req
    logger.info(`AuthController: publicUserLogin body ${JSON.stringify(body)}`)
    const service = new AuthService(db, logger)
    try {
      const publicUser = await service.publicUserLogin(
        body.email,
        body.password,
      )
      return publicUserLoginToken(res, publicUser)
    } catch (error) {
      return res.status(error.code ? error.code : 404).send({
        success: false,
        message: error.message,
      })
    }
  },
  publicUserSignup: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array())
    }
    const { winston, db, body, file } = req
    logger.info(
      `AuthController: publicUserSignup body ${JSON.stringify(
        body,
      )}and file:${JSON.stringify(file)}`,
    )
    const service = new AuthService(db, logger)
    const path = file.destination.replace('./public/', '/public/')

    try {
      const payload = {
        ...body,
        profile_picture: `${path}/${file.filename}`,
      }

      //console.log("payload-----",JSON.stringify(payload))
      const newPublicUser = await service.publicUserSignup(payload)
      //console.log("new public user ------->>>",newPublicUser)
      return publicUserSignupToken(res, newPublicUser)
    } catch (error) {
      return res.status(error?.code || 500).send({
        success: false,
        message: error.message,
      })
    }
  },
}

const senatorSignupToken = (res, result) => {
  result.id = result?.memberId ? result?.memberId : result?.id
  const token = jwt.sign({ ...result, role: 'senator' }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiration,
  })
  return res
    .status(201)
    .setHeader('Authorization', 'Bearer ' + token)
    .send({
      success: true,
      message: `Senator created successfully`,
      senator: result,
      token,
    })
}

const senatorLoginToken = (res, result) => {
  const { senator, ...data } = result
  senator.id = senator?.memberId ? senator?.memberId : senator?.id
  const token = jwt.sign(
    { ...senator, role: 'senator' },
    config.jwt.secretKey,
    {
      expiresIn: config.jwt.expiration,
    },
  )

  return res
    .status(200)
    .setHeader('Authorization', 'Bearer ' + token)
    .send({
      success: true,
      message: `Senator login successfully`,
      senator,
      data,
      token,
    })
}

const publicUserSignupToken = (res, result) => {
  //console.log("result----", result);
   const { id, first_name, last_name, email, designation, phone, username, profile_picture } = result.dataValues;

  const token = jwt.sign(
    { id, first_name, last_name, email, designation, phone, username, profile_picture, role: 'public-user' },
    config.jwt.secretKey,
    {
      expiresIn: config.jwt.expiration,
    },
  );
  //console.log("token----", token);
  return res
    .status(201)
    .setHeader('Authorization', 'Bearer ' + token)
    .send({
      success: true,
      message: `Public User created successfully`,
      publicUser: result,
      token,
    })
}

const publicUserLoginToken = (res, result) => {
  const { id, first_name, last_name, email, designation, phone, username, profile_picture } = result.dataValues;

  const token = jwt.sign(
    { id, first_name, last_name, email, designation, phone, username, profile_picture, role: 'public-user' },
    config.jwt.secretKey,
    {
      expiresIn: config.jwt.expiration,
    },
  );

  return res
    .status(200)
    .setHeader('Authorization', 'Bearer ' + token)
    .send({
      success: true,
      message: `Public User login successfully`,
      publicUser: result,
      token,
    })
}
module.exports = AuthController
