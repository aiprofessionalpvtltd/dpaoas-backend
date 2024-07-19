const Joi = require('joi');

const createUserValidation = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNo: Joi.string().required(),
  gender: Joi.string().required(),
  password: Joi.required(),
  userStatus: Joi.string().required(),
  fileNumber: Joi.number().required(),
  roleId: Joi.number().required(),
  departmentId : Joi.number().required(),
  designationId : Joi.number().required()
});

module.exports = createUserValidation;