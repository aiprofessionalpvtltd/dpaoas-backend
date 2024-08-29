const tenuresService = require("../services/tenures.service")
const db = require("../models")
const Tenures = db.tenures
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const tenuresController = {

    // Create Tenure 
    createTenure: async (req, res) => {
        try {
            logger.info(`tenuresController: createTenure body ${JSON.stringify(req.body)}`)
            const tenure = await tenuresService.createTenure(req.body);
            logger.info("Tenure Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Tenure Created Successfully!",
                data: tenure,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Tenures
    getAllTenures: async (req, res) => {
        try {
            logger.info(`tenuresController: getAllTenures query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            let  tenureType = req.query.tenureType;
            
        
            const { count, totalPages, tenures } = await tenuresService.getAllTenures(currentPage, pageSize,tenureType);
            // Check if there are no tenures on the current page
            if (tenures.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Tenures Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Tenures Fetched Successfully!",
                data: {
                    tenures,
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

    // Retrive Single Tenure
    getSingleTenure: async (req, res) => {
        try {
            logger.info(`tenuresController: getSingleTenure id ${JSON.stringify(req.params.id)}`)
            const tenureId = req.params.id;
            const fetchedTenure = await tenuresService.getSingleTenure(tenureId);
            logger.info("Single Tenure Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Tenure Fetched Successfully!",
                data: fetchedTenure,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Tenure
    updateTenure: async (req, res) => {
        try {
            logger.info(`tenuresController: updateTenure id  ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`)
            const tenureId = req.params.id;
            const tenure = await Tenures.findByPk(tenureId);
            if (!tenure) {
                return res.status(200).send({
                    success: true,
                    message: "Tenure Not Found!",
                })
            }
            const updatedTenure = await tenuresService.updateTenure(req.body, tenureId);
            logger.info("Tenure Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Tenure Updated Successfully!",
                data: updatedTenure,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Tenure
    deleteTenure: async (req, res) => {
        try {
            logger.info(`tenuresController: deleteTenure id ${JSON.stringify(req.params.id)}`)
            const tenureId = req.params.id;
            const tenure = await Tenures.findByPk(tenureId);
            if (!tenure) {
                return res.status(200).send({
                    success: true,
                    message: "Tenure Not Found!",
                })
            }
            const deletedTenure = await tenuresService.deleteTenure(tenureId);
            logger.info("Tenure Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Tenure Deleted Successfully!",
                data: deletedTenure,
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


module.exports = tenuresController
