const manageCommitteesService = require('../services/manageCommittees.service');
const logger = require('../common/winston');
const db = require("../models");
const ManageCommittees = db.manageCommittees;
const ManageCommitteesController = {

  // Create a new Manage Committees
  createManageCommittees: async (req, res) => {
    try {
      const manageCommittees = await manageCommitteesService.createManageCommittees(req.body);
      logger.info("Manage Committees Created Successfully!");
      return res.status(200).send({
        success: true,
        message: "Manage Committees Created Successfully!",
        data: manageCommittees,
      })
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrieves All Manage Committees
  findAllManageCommittees: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, manageCommittees } = await manageCommitteesService.findAllManageCommittees(currentPage, pageSize);

      if (manageCommittees.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: false,
          message: 'No data found on this page!'
        });
      }
      else {
        logger.info("All Manage Committees Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "All Manage Committees Fetched Successfully!",
          data: { manageCommittees, totalPages, count }
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

  // Retrieve Single Manage Committee
  findSingleManageCommittee: async (req, res) => {
    try {
      const manageCommitteeId = req.params.id
      const manageCommittee = await manageCommitteesService.findSingleManageCommittee(manageCommitteeId);
      logger.info("Single Manage Committee Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Manage Committee Fetched Successfully!",
        data: [manageCommittee],
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
  updateManageCommittee: async (req, res) => {
    try {
      const manageCommitteeId = req.params.id;
      const manageCommittee = await ManageCommittees.findByPk(manageCommitteeId);
      if (!manageCommittee) {
        return res.status(200).send({
          success: false,
          message: "Manage Committee Not Found!",
          data: null
        })
      }
      const updatedManageCommittee = await manageCommitteesService.updatemanageCommittee(req, manageCommitteeId);
      logger.info("Manage Committee Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Manage Committee Updated Successfully!",
        data: updatedManageCommittee,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delets/Suspend the Manage Committee
  deleteManageCommittee: async (req, res) => {
    try {
      const manageCommitteeId = req.params.id;
      const manageCommittee = await ManageCommittees.findByPk(manageCommitteeId);
      if (!manageCommittee) {
        return res.status(200).send({
          success: false,
          message: "Manage Committee Not Found!",
          data: null
        })
      }
      const deletedManageCommittee = await manageCommitteesService.deleteManageCommittee(manageCommitteeId);

      logger.info("Manage Committee Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Manage Committee Deleted Successfully!",
        data: deletedManageCommittee,
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

module.exports = ManageCommitteesController;