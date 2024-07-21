const Joi = require('joi');
exports.createDepartmentValidation = (req, res, next) => {
    const createDepartmentSchema = Joi.object({
        departmentName: Joi.string().required(),
        description: Joi.string().optional(),
        departmentStatus: Joi.string().optional()

    })
    const { error } = createDepartmentSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};

exports.createDesignationValidation = (req, res, next) => {
    const createDesignationSchema = Joi.object({
        designationName: Joi.string().required(),
        description: Joi.string().optional(),
        designationStatus: Joi.string().optional()
    })
    const { error } = createDesignationSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
}


