module.exports = {
  otp: {
    encoding: process.env.OTP_ENCODING || 'base32',
    step: process.env.OTP_EXPIRY_TIME || 300,
    window: process.env.OTP_WINDOW || 0,
    digits: process.env.OTP_DIGIT || 4,
  },
}
