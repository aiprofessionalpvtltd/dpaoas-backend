const Joi = require('joi');

const createRoleValidation = Joi.object({
    name: Joi.string().required()
});

module.exports = createRoleValidation