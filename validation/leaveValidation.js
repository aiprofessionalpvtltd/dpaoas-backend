const Joi = require('joi');
exports.leaveRequestValidation = (req, res, next) => {
    const createLeaveSchema = Joi.object({
        fkRequestTypeId: Joi.number().required(),
        fkUserId: Joi.number().required(),
        requestLeaveSubmittedTo: Joi.number().required(),
        requestStatus:Joi.string(),
        requestLeaveApplyOnBehalf:Joi.any(),
        requestLeaveForwarder:Joi.any(),
        requestNumberOfDays:Joi.string(),
        requestStartDate: Joi.date().required(),
        requestEndDate: Joi.date().required(),
        requestLeaveSubType: Joi.string().required(),
        requestLeaveReason: Joi.string().required(),
        requestStationLeave: Joi.boolean()
    })
    const { error } = createLeaveSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};
exports.leaveupdateValidation = (req, res, next) => {
    const updateLeaveSchema = Joi.object({
        fkRequestTypeId: Joi.number(),
        fkUserId: Joi.number(),
        requestStartDate: Joi.date(),
        requestEndDate: Joi.date(),
        requestLeaveSubmittedTo: Joi.number(),
        requestLeaveSubType: Joi.string(),
        requestLeaveReason: Joi.string(),
        requestStationLeave: Joi.boolean(),
        requestStatus:Joi.string(),
        requestLeaveApplyOnBehalf:Joi.any(),
        requestLeaveForwarder:Joi.any(),
        requestNumberOfDays:Joi.string(),
        leaveComment: Joi.string().required(),
        commentedBy: Joi.number().required(),
    })
    const { error } = updateLeaveSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};

