const Joi = require('joi');
exports.createResolutionValidation = (req, res, next) => {
    const createResolutionSchema = Joi.object({
        resolutionType: Joi.string().required(),
        
    })
    const { error } = createResolutionSchema.validate(req.body.fields)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};