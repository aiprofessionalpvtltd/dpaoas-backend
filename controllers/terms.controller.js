const termsService = require("../services/terms.service")
const db = require("../models")
const Terms = db.terms
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const termsController = {

    // Create Term 
    createTerm: async (req, res) => {
        try {
            logger.info(`termsController: createTerm body ${JSON.stringify(req.body)}`)
            const term = await termsService.createTerm(req.body);
            logger.info("Term Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Term Created Successfully!",
                data: term,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Terms
    getAllTerms: async (req, res) => {
        try {
            logger.info(`termsController: getAllTerms query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, terms } = await termsService.getAllTerms(currentPage, pageSize);
            // Check if there are no terms on the current page
            if (terms.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Terms Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Terms Fetched Successfully!",
                data: {terms,
                totalPages,
                count}
            });

        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrive Single Term
    getSingleTerm: async (req, res) => {
        try {
            logger.info(`termsController: getSingleTerm params id ${JSON.stringify(req.params.id)}`)
            const termId = req.params.id;
            const fetchedTerm = await termsService.getSingleTerm(termId);
            logger.info("Single Term Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Term Fetched Successfully!",
                data: fetchedTerm,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Term
    updateTerm: async (req, res) => {
        try {
            logger.info(`termsController: updateTerm id and body ${JSON.stringify(req.params.id, req.body)}`)
            const termId = req.params.id;
            const term = await Terms.findByPk(termId);
            if (!term) {
                return res.status(200).send({
                    success: true,
                    message: "Term Not Found!",
                })
            }
            const updatedTerm = await termsService.updateTerm(req.body, termId);
            logger.info("Term Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Term Updated Successfully!",
                data: updatedTerm,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Term
    deleteTerm: async (req, res) => {
        try {
            logger.info(`termsController: deleteTerm params id ${JSON.stringify(req.params.id)}`)
            const termId = req.params.id;
            const term = await Terms.findByPk(termId);
            if (!term) {
                return res.status(200).send({
                    success: true,
                    message: "Term Not Found!",
                })
            }
            const deletedTerm = await termsService.deleteTerm(termId);
            logger.info("Term Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Term Deleted Successfully!",
                data: deletedTerm,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

      // Retrive Single Term
      getSingleTermByTenureID: async (req, res) => {
        try {
            logger.info(`termsController: getSingleTerm params id ${JSON.stringify(req.params.id)}`)
            const termId = req.params.id;
            const fetchedTerm = await termsService.getSingleTermByTenureID(termId);
            logger.info("Single Term Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Term Fetched Successfully!",
                data: fetchedTerm,
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


module.exports = termsController
