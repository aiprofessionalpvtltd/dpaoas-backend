const Joi = require('joi');
exports.questionValidation = (req, res, next) => {
    const createQuestionSchema = Joi.object({
        fkSessionId: Joi.number().required(),
        questionCategory: Joi.string().required(),
        fkMemberId: Joi.number().required(),
        noticeOfficeDiaryNo: Joi.number().required(),
        noticeOfficeDiaryDate: Joi.string().required(),
        noticeOfficeDiaryTime: Joi.string().required(),
        // questionImage: Joi.string().required(),
        // englishText: Joi.string().required(),
        // urduText: Joi.string().required(),
     
    })
    const { error } = createQuestionSchema.validate(req.body.fields)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};