const speakeasy = require('speakeasy')
const config = require('../config/otp')

exports.generateSecret = () => {
  const secret = speakeasy.generateSecret({ length: 6 })
  return secret.base32
}
exports.generateOnetimeToken = (secret) => {
  return speakeasy.time({
    secret: secret,
    encoding: config.otp.encoding,
    step: config.otp.step,
    window: config.otp.window,
    digits: config.otp.digits,
  })
}

exports.verifyOnetimeToken = (token, secret) => {
  return speakeasy.time.verify({
    secret: secret,
    encoding: config.otp.encoding,
    token: token,
    step: config.otp.step,
    window: config.otp.window,
    digits: config.otp.digits,
  })
}
