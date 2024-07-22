const politicalPartiesSerivce = require("../services/politicalParties.service")
const db = require("../models")
const PoliticalParties = db.politicalParties
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const politicalPartiesController = {

    // Create Political Party 
    createPoliticalParty: async (req, res) => {
        try {
            logger.info(`politicalPartiesController: createPoliticalParty body ${JSON.stringify(req.body)}`)
            const politicalParty = await politicalPartiesSerivce.createPoliticalParty(req.body);
            logger.info("Political Party Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Political Party Created Successfully!",
                data: politicalParty,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Political Parties
    getAllPoliticalParties: async (req, res) => {
        try {
            logger.info(`politicalPartiesController: getAllPoliticalParties query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, politicalParties } = await politicalPartiesSerivce.getAllPoliticalParties(currentPage, pageSize);
            // Check if there are no political parties on the current page
            if (politicalParties.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Political Parties Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Political Parties Fetched Successfully!",
                data: {
                    politicalParties,
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

    // Retrive Single Political Party
    getSinglePoliticalParty: async (req, res) => {
        try {
            logger.info(`politicalPartiesController: getSinglePoliticalParty id ${JSON.stringify(req.params.id)}`)
            const politicalPartyId = req.params.id;
            const fetchedPoliticalParty = await politicalPartiesSerivce.getSinglePoliticalParty(politicalPartyId);
            logger.info("Single Political Party Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Political Party Fetched Successfully!",
                data: fetchedPoliticalParty,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Political Party
    updatePoliticalParty: async (req, res) => {
        try {
            logger.info(`politicalPartiesController: updatePoliticalParty id and body ${JSON.stringify(req.params.id, req.body)}`)
            const politicalPartyId = req.params.id;
            const politicalParty = await PoliticalParties.findByPk(politicalPartyId);
            if (!politicalParty) {
                return res.status(200).send({
                    success: true,
                    message: "Political Party Not Found!",
                })
            }
            const updatedPolitcalParty = await politicalPartiesSerivce.updatePoliticalParty(req.body, politicalPartyId);
            logger.info("Political Party Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Political Party Updated Successfully!",
                data: updatedPolitcalParty,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Political Party
    deletePoliticalParty: async (req, res) => {
        try {
            logger.info(`politicalPartiesController: deletePoliticalParty id ${JSON.stringify(req.params.id)}`)
            const politicalPartyId = req.params.id;
            const politicalParty = await PoliticalParties.findByPk(politicalPartyId);
            if (!politicalParty) {
                return res.status(200).send({
                    success: true,
                    message: "Political Party Not Found!",
                })
            }
            const deletedPoliticalParty = await politicalPartiesSerivce.deletePoliticalParty(politicalPartyId);
            logger.info("Political Party Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Political Party Deleted Successfully!",
                data: deletedPoliticalParty,
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


module.exports = politicalPartiesController
