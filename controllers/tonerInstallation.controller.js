const tonerInstallationService = require("../services/tonerInstallation.service")
const db = require("../models")
const Sessions = db.sessions
const TonerModels = db.tonerInstallations
const TonerInstallations = db.tonerInstallations
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const tonerInstallationController = {

    // Create Toner Installation 
    createTonerInstallation: async (req, res) => {
        try {
            logger.info(`tonerInstallationController: createTonerInstallation body ${JSON.stringify(req.body)}`)

            const tonerInstallation = await tonerInstallationService.createTonerInstallation(req.body);
            logger.info("Toner Installation Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Toner Installation Created Successfully!",
                data: tonerInstallation,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Toner Installations
    getAllTonerInstallations: async (req, res) => {
        try {
            logger.info(`tonerInstallationController: getAllTonerInstallations query ${JSON.stringify(req.query)}`)
            const currentPage = req.query.currentPage !== "undefined" ? parseInt(req.query.currentPage) : null;
            const pageSize = req.query.pageSize !== "undefined" ? parseInt(req.query.pageSize) : null;
            const { count, totalPages, tonerInstallations } = await tonerInstallationService.getAllTonerInstallations(currentPage, pageSize);
            // Check if there are no inventories on the current page
            if (tonerInstallations.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Toner Installations Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Toner Installations Fetched Successfully!",
                data: {
                    tonerInstallations,
                    totalPages,
                    count
                }
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Search Toner Installation
    searchTonerInstallation: async (req, res) => {
        try {
            logger.info(`tonerInstallationController: searchTonerInstallation query ${JSON.stringify(req.query)}`)
            if (Object.keys(req.query).length !== 0) {
                // Assuming the search criteria are passed as query parameters
                const searchCriteria = req.query; // This will be an object with search fields   
                const searchResults = await tonerInstallationService.searchTonerInstallation(searchCriteria);
                if (searchResults.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Toner Installation Search Results!",
                        data: searchResults,
                    });
                } else {
                    logger.info("Data Not Found!");
                    return res.status(200).send({
                        success: true,
                        message: "Data Not Found!",
                        data: searchResults,
                    });
                }
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },
    // Retrive Single Toner Installation
    getSingleTonerInstallation: async (req, res) => {
        try {
            logger.info(`tonerInstallationController: searchTonerModel id ${JSON.stringify(req.params.id)}`)
            const tonerInstallationId = req.params.id;
            const fetchedTonerInstallation = await tonerInstallationService.getSingleTonerInstallation(tonerInstallationId);
            logger.info("Single Toner Installation Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Toner Installation Fetched Successfully!",
                data: fetchedTonerInstallation,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Toner Installation
    updateTonerInstallation: async (req, res) => {
        try {
            logger.info(`tonerInstallationController: updateTonerModel id and body ${JSON.stringify(req.params.id, req.body)}`)
            const tonerInstallationId = req.params.id;
            const tonerInstallation = await TonerInstallations.findByPk(tonerInstallationId);
            if (!tonerInstallation) {
                throw ({ message: "Toner Installation Not Found!" });
            }
            const updatedTonerInstallation= await tonerInstallationService.updateTonerInstallation(req.body, tonerInstallationId);
            logger.info("Toner Installation Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Toner Installation Updated Successfully!",
                data: updatedTonerInstallation,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Toner Installation
    deleteTonerInstallation: async (req, res) => {
        try {
            logger.info(`tonerInstallationController: deleteTonerModel id ${JSON.stringify(req.params.id)}`)
            const tonerInstallationId = req.params.id;
            const tonerInstallation = await TonerInstallations.findByPk(tonerInstallationId);
            if (!tonerInstallation) {
                throw ({ message: "Toner Installation Not Found!" });
            }
            const deletedTonerModel = await tonerInstallationService.deleteTonerInstallation(tonerInstallationId);
            logger.info("Toner Installation Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Toner Installation Deleted Successfully!",
                data: deletedTonerModel,
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


module.exports = tonerInstallationController