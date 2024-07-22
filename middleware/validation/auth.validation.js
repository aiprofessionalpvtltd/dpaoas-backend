const { check } = require('express-validator')
const invalidEmailMessage = `Please include a valid email`
const invalidPasswordMessage = `Password must be 8 or more characters`
const invalidFirstName = `First Name is required`
exports.loginValidation = [
  check('email', invalidEmailMessage).isEmail().notEmpty(),
  check('password', invalidPasswordMessage).notEmpty().isLength({
    min: 8,
  }),
]

exports.signUpValidation = [
  check('email', invalidEmailMessage).notEmpty().isEmail(),
  check('role')
    .isIn(['SUPER_ADMIN', 'ADMIN', 'IT_CONSULTANT', 'ACCOUNTANT', 'OTHERS'])
    .notEmpty(),
  check('first_name', invalidFirstName).not().isEmpty(),
  check('password', invalidPasswordMessage).isLength({
    min: 8,
  }),
]

exports.attendeeSignUpValidation = [
  check('email', invalidEmailMessage).notEmpty().isEmail(),
  check('first_name', invalidFirstName).not().isEmpty(),
  check('password', invalidPasswordMessage).isLength({
    min: 8,
  }),
]

exports.senatorSignUpValidation = [
  check('email', invalidEmailMessage).notEmpty().isEmail(),
  check('first_name', invalidFirstName).not().isEmpty(),
  check('last_name', 'Last Name is required').not().isEmpty(),
  check('cnic', 'CNIC is required').not().isEmpty(),
  check('password', invalidPasswordMessage).isLength({
    min: 6,
  }),
]
