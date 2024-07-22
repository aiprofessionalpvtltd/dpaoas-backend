'use strict'

const config = require('../config/jwt')
const jwt = require('jsonwebtoken')

// No Validation Require
exports.pass = (req, res, next) => {
  next()
}

exports.authenticateUser = async (req, res, next) => {
  const { winston, headers } = req
  //winston.info(`${req.originalUrl} API authentication check`)

  const token = headers.authorization?.split(' ')[1]
  if (token) {
    jwt.verify(token, config.jwt.secretKey, function (err, user) {
      if (err) {
        return res.status(401).send({
          success: false,
          message: 'User is not authorized to make this request',
          expiredAt: err.expiredAt,
          errorMessage: err.message,
        })
      }
      req.user = user
      next()
    })
  } else {
    winston.info(`authenticateUser: missing either token:${token}`)
    return res.status(401).send({
      success: false,
      message: 'User is not authorized to make this request',
      data: [],
    })
  }
}
