const Joi = require('joi');
exports.createPassValidation = (req, res, next) => {
    const createPassSchema = Joi.object({
        passDate: Joi.string().required(),
        requestedBy: Joi.string().required(),
        branch: Joi.string().optional(),
        visitPurpose: Joi.string().required(),
        cardType: Joi.string().optional(),
        companyName: Joi.string().optional(),
        fromDate: Joi.string().required(),
        toDate: Joi.string().required(),
        allowOffDays: Joi.array().items(Joi.string()).optional(),
        passStatus: Joi.string().optional(),
        remarks: Joi.string().optional(),

    })
    const { error } = createPassSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};

exports.createVisitorValidation = (req, res, next) => {
    const createVisitorSchema = Joi.object({
        name: Joi.string().required(),
        cnic: Joi.string().required(),
        details: Joi.string().required(),
        visitorStatus: Joi.string().optional()
    })
    const { error } = createVisitorSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
}


