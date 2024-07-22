
const designationsService = require('../services/designations.service');
const logger = require('../common/winston');
const db = require("../models");
const Designations = db.designations

const designationsController = {
  // Create and Save a new Designation
  createDesignation: async (req, res) => {
    try {
      logger.info(`designationsController: createDesignation body ${JSON.stringify(req.body)}`);
      // Validate the department data
      if (!req.body.designationName) {
        return res.status(200).send({
          success: true,
          message: "Please Provide Designation Name!",
        })
      }
      const designation = await designationsService.createDesignation(req.body);
      logger.info("Designation Created Successfully!")
      return res.status(200).send({
        success: true,
        message: "Designation Created Successfully!",
        data: designation,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrieve All Designations
  findAllDesignations: async (req, res) => {
    try {
      logger.info(`designationsController: findAllDesignations query ${JSON.stringify(req.query)}`);
      // Parsing query parameters for pagination
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, designations } = await designationsService.findAllDesignations(currentPage, pageSize);
      // Check if there are no departments on the current page
      if (designations.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: false,
          message: 'No data found on this page!'
        });
      }
      logger.info("All Designations Fetched Successfully!");
      return res.status(200).send({
        success: true,
        message: "All Designations Fetched Successfully!",
        data: {
          designations,
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

  // Search Designations
  searchDesignations: async (req, res) => {
    try {
      logger.info(`designationsController: searchDesignations query ${JSON.stringify(req.query)}`);
      const searchQuery = req.query.search; // Get search query from request parameters
      const queryOptions = {};
      const searchedDesignation = await designationsService.searchDesignations(searchQuery, queryOptions)
      if (searchedDesignation.length > 0) {
        logger.info("Searched Successfully!");
        return res.status(200).send({
          success: true,
          message: "Designations Search Results!",
          data: searchedDesignation,
        });
      }
      else {
        logger.info("Data Not Found!");
        return res.status(200).send({
          success: true,
          message: "Data Not Found!",
          data: [],
        });
      }

    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  // Retrieve Single Designation
  findSingleDesignation: async (req, res) => {
    try {
      logger.info(`designationsController: findSingleDesignation id ${JSON.stringify(req.params.id)}`);
      const designationId = req.params.id
      const designation = await designationsService.findSingleDesignation(designationId);
      logger.info("Single Designation Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Designation Fetched Successfully!",
        data: designation,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Updates the Designation
  updateDesignation: async (req, res) => {
    try {
      logger.info(`designationsController: updateDesignation body ${JSON.stringify(req.body)} and id ${JSON.stringify(req.params.id)}`);
      const designationId = req.params.id;
      const designation = await Designations.findByPk(designationId);
      if (!designation) {
        return res.status(200).send({
          success: true,
          message: "Designation Not Found!",
        })
      }
      const updatedDesignation = await designationsService.updateDesignation(req.body, designationId);
      logger.info("Designation Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Designation Updated Successfully!",
        data: updatedDesignation,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delets/Suspend the Designation
  deleteDesignation: async (req, res) => {
    try {
      logger.info(`designationsController: deleteDesignation id ${JSON.stringify(req.params.id)}`);
      const designationId = req.params.id;
      const designation = await Designations.findByPk(designationId);
      if (!designation) {
        return res.status(200).send({
          success: true,
          message: "Designation Not Found!",
        })
      }
      const deletedDesignation = await designationsService.deleteDesignation(designationId);
      logger.info("Designation Suspend/Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Designation Suspend/Deleted Successfully!",
        data: deletedDesignation,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

   //Suspend the Designation
 suspendDesignation: async(req,res) =>
 {
     try {
         const designation = await designationsService.suspendDesignation(req);   
         logger.info("Designation Suspend/Deleted Successfully!")
         return res.status(200).send({
           success: true,
           message: "Designation Suspend/Deleted Successfully!",
           data: designation,
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

module.exports = designationsController;