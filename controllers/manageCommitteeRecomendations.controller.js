const manageCommitteeRecomendationsService = require('../services/manageCommitteeRecomendations.service');
const logger = require('../common/winston');
const db = require("../models");
const ManageCommitteeRecomendations = db.manageCommitteeRecomendations;
const ManageCommitteeRecomendationController = {

  // Create a new Manage Committees Recomendation
  createManageCommitteeRecomendations: async (req, res) => {
    try {
      const manageCommitteeRecomendation = await manageCommitteeRecomendationsService.createManageCommitteeRecomendations(req.body);
      logger.info("Committees Recomendation Created Successfully!");
      return res.status(200).send({
        success: true,
        message: "Committees Recomendation Created Successfully!",
        data: manageCommitteeRecomendation,
      })
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrieves All Manage Committees Recommendations
  findAllManageCommitteeRecomendations: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, manageCommitteeRecomendation } = await manageCommitteeRecomendationsService.findAllManageCommitteeRecomendations(currentPage, pageSize);

      if (manageCommitteeRecomendation.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: false,
          message: 'No data found on this page!'
        });
      }
      else {
        logger.info("All Committees Recomendation Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "All Committees Recomendation Fetched Successfully!",
          data: { manageCommitteeRecomendation, totalPages, count }
        })
      }

    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  // Retrieve Single Manage Committee Recommendation
  findSingleManageCommitteeRecomendations: async (req, res) => {
    try {
      const committeeRecommendationId = req.params.id
      const manageCommitteeRecomendation = await manageCommitteeRecomendationsService.findSingleManageCommitteeRecomendations(committeeRecommendationId);
      logger.info("Single Committee Recomendation Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Committee Recomendation Fetched Successfully!",
        data: [manageCommitteeRecomendation],
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Update the Manage Committee
  updateManageCommitteeRecomendations: async (req, res) => {
    try {
      const committeeRecommendationId = req.params.id;
      const manageCommitteeRecomendation = await ManageCommitteeRecomendations.findByPk(committeeRecommendationId);
      if (!manageCommitteeRecomendation) {
        return res.status(200).send({
          success: false,
          message: "Committee Recomendation Not Found!",
          data: null
        })
      }
      const updatedManageCommitteeRecomendation = await manageCommitteeRecomendationsService.updateManageCommitteeRecomendations(req, committeeRecommendationId);
      logger.info("Committee Recomendation Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Committee Recomendation Updated Successfully!",
        data: updatedManageCommitteeRecomendation,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delets/Suspend the Manage Committee Recomendations
  deleteManageCommitteeRecomendation: async (req, res) => {
    try {
      const committeeRecommendationId = req.params.id;
      const manageCommitteeRecomendation = await ManageCommitteeRecomendations.findByPk(committeeRecommendationId);
      if (!manageCommitteeRecomendation) {
        return res.status(200).send({
          success: false,
          message: "Committee Recomendation Not Found!",
          data: null
        })
      }
      const deletedManageCommitteeRecomendation = await manageCommitteeRecomendationsService.deleteManageCommitteeRecomendation(committeeRecommendationId);

      logger.info("Committee Recomendation Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Committee Recomendation Deleted Successfully!",
        data: deletedManageCommitteeRecomendation,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = ManageCommitteeRecomendationController;