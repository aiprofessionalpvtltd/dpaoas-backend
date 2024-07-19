const seatingPlanService = require("../services/seatingPlan.service")
const db = require("../models")
const SeatingPlan = db.seatingPlans
const Sessions = db.sessions
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const seatingPlanController = {

    //Assign Seat To A Member
    updateSeatAssignment: async (req, res) => {
        try {
            logger.info(`seatingPlanController: updateSeatAssignment seatNumber ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`)
            const seatNumber = req.params.id;
            const existingSeat = await SeatingPlan.findOne({
                where: { seatNumber: seatNumber }
            });
            const seatAssignment = await seatingPlanService.updateSeatAssignment(req.body, seatNumber, existingSeat);
            logger.info('Seat Assignment Updated Successfully!');
            return res.status(200).send({
                success: true,
                message: 'Seat Assignment Updated Successfully!',
                data: seatAssignment
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Get All Seat Details
    getAllSeatDetails: async (req, res) => {
        try {
            logger.info(`seatingPlanController: getAllSeatDetails`)
            const seatDetails = await seatingPlanService.getAllSeatDetails();
            logger.info("All Seats Details Retrieved Successfully!")
            return res.status(200).send({
                success: true,
                message: "All Seats Details Retrieved Successfully!",
                data: seatDetails,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Get Seat Details
    getSingleSeatDetails: async (req, res) => {
        try {
            logger.info(`seatingPlanController: getSingleSeatDetails seatNumber ${JSON.stringify(req.params.id)}`)
            const seatNumber = req.params.id;
            const seatDetails = await seatingPlanService.getSeatDetails(seatNumber);
            logger.info("Single Seat Details Retrieved Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Seat Details Retrieved Successfully!",
                data: seatDetails,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },
}

module.exports = seatingPlanController