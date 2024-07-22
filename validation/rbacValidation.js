const Joi = require('joi');


exports.createRoleValidation = (req, res, next) => {
    const createRoleSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        roleStatus: Joi.string().optional()

    })
    const { error } = createRoleSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
}


