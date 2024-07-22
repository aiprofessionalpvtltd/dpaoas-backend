const Joi = require('joi');
exports.createEmployeeValidation = (req, res, next) => {
    const createEmployeeSchema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        userName: Joi.string().required(),
        phoneNo: Joi.string().required(),
        gender: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        fileNumber: Joi.number().required(),
        supervisor: Joi.number().optional(),
        fkRoleId: Joi.number().required(),
        fkDepartmentId: Joi.number().optional(),
        fkDesignationId: Joi.number().required(),
        fkBranchId: Joi.number().required(),
        userType: Joi.string().valid("Section User", "Section", "Officer").optional(),
        reportingTo: Joi.string().valid("Director", "Director General", "Senior Director General", "Secretary", "Chairman").optional()
    })
    const { error } = createEmployeeSchema.validate(req.body)
    if (error) {
        return res.status(400).send({ success: false, message: error.message })
    }
    next()
};


