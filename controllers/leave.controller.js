const leaveService = require("../services/leave.service")
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const leaveController = {
    // Creates A New User
    createleave: async (req, res) => {
        try {
            const { body } = req
            logger.info(`LeaveController: createleave body ${JSON.stringify(body)}`)
            const result = await leaveService.createleave(body);
            logger.info('Leave Request submitted Successfully!');
            return res.status(201).send({
                success: true,
                message: `Leave Request submitted successfully`,
                data: { id: result.insertId, ...body },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },
    // Update User
    updateleave: async (req, res) => {
        try {
            const { body, params } = req
            const { id } = params
            logger.info(
                `LeaveController: updateLeaveRequest id ${id} and body ${JSON.stringify(
                    body,
                )}`,
            )
            const result = await leaveService.updateleave(id, body);
            logger.info('Leave Request Updated Successfully!');
            return res.status(201).send({
                success: true,
                message: `Leave Request Updated successfully`,
                data: { id: result.insertId, ...body },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

}
module.exports = leaveController;

