const tonerModelService = require("../services/tonerModel.service")
const db = require("../models")
const Sessions = db.sessions
const TonerModels = db.tonerModels
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const tonerModelController = {

    // Create Toner Model 
    createTonerModel: async (req, res) => {
        try {
            logger.info(`tonerModelController: createTonerModel body ${JSON.stringify(req.body)}`)

            const tonerModel = await tonerModelService.createTonerModel(req.body);
            logger.info("Toner Model Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Toner Model Created Successfully!",
                data: tonerModel,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Toner Models
    getAllTonerModels: async (req, res) => {
        try {
            logger.info(`tonerModelController: getAllTonerModels query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, tonerModels } = await tonerModelService.getAllTonerModels(currentPage, pageSize);
            // Check if there are no inventories on the current page
            if (tonerModels.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Toner Models Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Toner Models Fetched Successfully!",
                data: {
                    tonerModels,
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

    // Search Toner Model
    searchTonerModel: async (req, res) => {
        try {
            logger.info(`tonerModelController: searchTonerModel query ${JSON.stringify(req.query)}`)
            if (Object.keys(req.query).length !== 0) {
                // Assuming the search criteria are passed as query parameters
                const searchCriteria = req.query; // This will be an object with search fields   
                const searchResults = await tonerModelService.searchTonerModel(searchCriteria);
                if (searchResults.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Toner Model Search Results!",
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
    // Retrive Single Toner Model
    getSingleTonerModel: async (req, res) => {
        try {
            logger.info(`tonerModelController: searchTonerModel id ${JSON.stringify(req.params.id)}`)
            const tonerModelId = req.params.id;
            const fetchedTonerModel = await tonerModelService.getSingleTonerModel(tonerModelId);
            logger.info("Single Toner Model Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Toner Model Fetched Successfully!",
                data: fetchedTonerModel,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Toner Model
    updateTonerModel: async (req, res) => {
        try {
            logger.info(`tonerModelController: updateTonerModel id and body ${JSON.stringify(req.params.id, req.body)}`)
            const tonerModelId = req.params.id;
            const tonerModel = await TonerModels.findByPk(tonerModelId);
            if (!tonerModel) {
                throw ({ message: "Toner Model Not Found!" });
            }
            const updatedTonerModel = await tonerModelService.updateTonerModel(req.body, tonerModelId);
            logger.info("Toner Model Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Toner Model Updated Successfully!",
                data: updatedTonerModel,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Toner Model
    deleteTonerModel: async (req, res) => {
        try {
            logger.info(`tonerModelController: deleteTonerModel id ${JSON.stringify(req.params.id)}`)
            const tonerModelId = req.params.id;
            const tonerModel = await TonerModels.findByPk(tonerModelId);
            if (!tonerModel) {
                throw ({ message: "Toner Model Not Found!" });
            }
            const deletedTonerModel = await tonerModelService.deleteTonerModel(tonerModelId);
            logger.info("Toner Model Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Toner Model Deleted Successfully!",
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


module.exports = tonerModelController