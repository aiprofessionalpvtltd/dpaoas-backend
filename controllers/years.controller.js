const yearsService = require("../services/years.service")
const db = require("../models")
const Years = db.years
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const yearsController = {

    // Create Year 
    createYear: async (req, res) => {
        try {
            logger.info(`yearsController: createYear body ${JSON.stringify(req.body)}`)
            const year = await yearsService.createYear(req.body);
            logger.info("Year Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Year Created Successfully!",
                data: year,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Years
    getAllYears: async (req, res) => {
        try {
            logger.info(`yearsController: getAllYears query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, years } = await yearsService.getAllYears(currentPage, pageSize);
            // Check if there are no years on the current page
            if (years.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Years Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Years Fetched Successfully!",
                data: {
                    years,
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

    // Retrive Single Year
    getSingleYear: async (req, res) => {
        try {
            logger.info(`yearsController: getSingleYear id ${JSON.stringify(req.params.id)}`)
            const yearId = req.params.id;
            const fetchedYear = await yearsService.getSingleYear(yearId);
            logger.info("Single Year Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Year Fetched Successfully!",
                data: fetchedYear,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Year
    updateYear: async (req, res) => {
        try {
            logger.info(`yearsController: updateYear id  ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`)
            const yearId = req.params.id;
            const year = await Years.findByPk(yearId);
            if (!year) {
                return res.status(200).send({
                    success: true,
                    message: "Year Not Found!",
                })
            }
            const updatedYear = await yearsService.updateYear(req.body, yearId);
            logger.info("Year Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Year Updated Successfully!",
                data: updatedYear,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Year
    deleteYear: async (req, res) => {
        try {
            logger.info(`yearsController: deleteYear id ${JSON.stringify(req.params.id)}`)
            const yearId = req.params.id;
            const year = await Years.findByPk(yearId);
            if (!year) {
                return res.status(200).send({
                    success: true,
                    message: "Year Not Found!",
                })
            }
            const deletedYear = await yearsService.deleteYear(yearId);
            logger.info("Year Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Year Deleted Successfully!",
                data: deletedYear,
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


module.exports = yearsController
