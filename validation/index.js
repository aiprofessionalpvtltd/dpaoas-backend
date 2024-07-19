const createUserValidation = require('./userValidation');
const createRoleValidation = require('./roleValidation');
const createLeaveValidator = require('./leaveValidation');
const createQuestionValidator = require('./questionValidation')

module.exports = {
  createUserValidation,
  createRoleValidation,
  createLeaveValidator,
  createQuestionValidator
};