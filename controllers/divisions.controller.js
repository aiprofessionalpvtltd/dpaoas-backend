const divisionsService = require("../services/divisions.service")
const db = require("../models")
const Divisions = db.divisions
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const divisionController = {

    // Create Division 
    createDivision: async (req, res) => {
        try {
            logger.info(`divisionsController: createDivision body ${JSON.stringify(req.body)}`)
            const division = await divisionsService.createDivision(req.body);
            logger.info("Division Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Division Created Successfully!",
                data: division,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Divisions
    getAllDivisions: async (req, res) => {
        try {
            logger.info(`divisionsController: createDivision query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, divisions } = await divisionsService.getAllDivisions(currentPage, pageSize);
            // Check if there are no divisions on the current page
            if (divisions.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Divisions Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Divisions Fetched Successfully!",
                data: {
                    divisions,
                    totalPages,
                    count
                }
            });

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrive Single Division
    getSingleDivision: async (req, res) => {
        try {
            logger.info(`divisionsController: createDivision id ${JSON.stringify(req.params.id)}`)
            const divisionId = req.params.id;
            const fetchedDivision = await divisionsService.getSingleDivision(divisionId);
            logger.info("Single Division Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Division Fetched Successfully!",
                data: fetchedDivision,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Division
    updateDivision: async (req, res) => {
        try {
            logger.info(`divisionsController: updateDivision id and body ${JSON.stringify(req.params.id, req.body)}`)
            const divisionId = req.params.id;
            const division = await Divisions.findByPk(divisionId);
            if (!division) {
                return res.status(200).send({
                    success: true,
                    message: "Division Not Found!",
                })
            }
            const updatedDivision = await divisionsService.updateDivision(req.body, divisionId);
            logger.info("Division Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Division Updated Successfully!",
                data: updatedDivision,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Division
    deleteDivision: async (req, res) => {
        try {
            logger.info(`divisionsController: deleteDivision id ${JSON.stringify(req.params.id)}`)
            const divisionId = req.params.id;
            const division = await Divisions.findByPk(divisionId);
            if (!division) {
                return res.status(200).send({
                    success: true,
                    message: "Division Not Found!",
                })
            }
            const deletedDivision = await divisionsService.deleteDivision(divisionId);
            logger.info("Division Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Division Deleted Successfully!",
                data: deletedDivision,
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


module.exports = divisionController
