const Joi = require('joi');
exports.motionRequestValidation = (req, res, next) => {
    const createmotionSchema = Joi.object({
        memberName: Joi.string().required(),
        fkTenureId: Joi.number().required(),
        memberStatus: Joi.string().required(),
        politicalParty: Joi.number().required(),
        electionType: Joi.string().required(),
        gender: Joi.string().required(),
        isMinister: Joi.boolean(),
    })
    const { error } = createmotionSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};
exports.motionupdateValidation = (req, res, next) => {
    const updateMemberSchema = Joi.object({
        fkRequestTypeId: Joi.number(),
        fkUserId: Joi.number(),
        requestStartDate: Joi.date(),
        requestEndDate: Joi.date(),
        requestLeaveSubmittedTo: Joi.number(),
        requestLeaveSubType: Joi.string(),
        requestLeaveReason: Joi.string(),
        requestStationLeave: Joi.boolean(),
        requestStatus: Joi.string(),
        requestLeaveApplyOnBehalf: Joi.any(),
        requestLeaveForwarder: Joi.any(),
        requestNumberOfDays: Joi.string(),
        leaveComment: Joi.string().required(),
        commentedBy: Joi.number().required(),
    })
    const { error } = updatemotionSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};

