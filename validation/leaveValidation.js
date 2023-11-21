const Joi = require('joi');
exports.leaveRequestValidation = (req, res, next) => {
    const createLeaveSchema = Joi.object({
        fkRequestTypeId: Joi.number().required(),
        fkUserId: Joi.number().required(),
        requestStartDate: Joi.date().required(),
        requestEndDate: Joi.date().required(),
        requestLeaveSubType: Joi.string().required(),
        requestLeaveReason: Joi.string().required(),
        requestStationLeave: Joi.boolean(),
    })
    const { error } = createLeaveSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};

