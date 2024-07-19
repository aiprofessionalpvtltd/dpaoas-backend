const nodemailer = require('nodemailer')
const config = require('../config/email')
const winston = require('../common/winston')
const handlebars = require('handlebars')
const fs = require('fs')

const emailTransport = () => {
  return nodemailer.createTransport({
    port: config.email.port,
    host: config.email.host,
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  })
}

const readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      throw err
    } else {
      callback(null, html)
    }
  })
}

exports.sendEmail = async (type, payload, sendTo, sendFrom) => {
  winston.info(` ${type} Email is going to send ${sendTo}`)
  let templateDir
  let subject
  const twoFactorTemplate = __dirname + '/email/2FactorV1Template.html'
  switch (type) {
    case 'VerifyEmail':
      templateDir = twoFactorTemplate
      subject = 'Two Factor Authentication'
      break
    case 'SenatorCreation':
      templateDir = twoFactorTemplate
      subject = 'Verify Senator Email Address'
      break
    case 'PasswordReset':
    case 'ForgotPassword':
      templateDir = twoFactorTemplate
      subject = 'OTP for Forgot Password Reset'
      break
    case 'EmailReset':
    case 'ForgotEmail':
      templateDir = twoFactorTemplate
      subject = type.split(/(?=[A-Z])/).join(' ')
      break
    case 'AccountVerification':
      templateDir = twoFactorTemplate
      subject = 'Account Email Verification'
      break
    default:
      break
  }
  if (!type) throw new Error('No template Exist for provided Type')
  try {
    readHTMLFile(templateDir, function (err, html) {
      const htmlTemplate = handlebars.compile(html)
      winston.info(`payload: ${JSON.stringify(payload)}`)
      const mailOptions = {
        from: sendFrom ? sendFrom : config.email.supportEmail,
        to: sendTo,
        subject,
        html: htmlTemplate(payload),
      }
      const transporter = emailTransport()
      return new Promise((resolved, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            reject(error)
            winston.error(`Email not sent: ${JSON.stringify(error)}`)
          } else {
            resolved(info.response)
            winston.info(`Email Send Successfully`)
          }
        })
      })
    })
  } catch (error) {
    winston.error(`Error occurred on Email sending: ${JSON.stringify(error)}`)
  }
}
