const visitorService = require('../services/visitors.service')
const logger = require('../common/winston');
const db = require("../models");
const Visitors = db.visitors;

const visitorController = {

  //Create A New Visitor
  createVisitor: async (req, res) => {
    try {
      const passId = req.params.id;
      const body = req.body;
      const visitor = await visitorService.createVisitor(body, passId);
      logger.info("Visitor Created Successfully!")
      return res.status(200).send({
        success: true,
        message: "Visitor Created Successfully!",
        data: visitor,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Create Duplicate Visitor
  createDuplicateVisitor: async (req, res) => {
    try {
      const passId = req.params.id;
      const body = req.body;
      const visitor = await visitorService.createDuplicateVisitor(body, passId);
      logger.info("Duplicate Visitor Created Successfully!")
      return res.status(200).send({
        success: true,
        message: "Duplicate Visitor Created Successfully!",
        data: visitor,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Find All Visitors 
  findAllVisitors: async (req, res) => {
    try {
      // Parsing query parameters for pagination
      const currentPage = parseInt(req.query.currentPage) ;
      const pageSize = parseInt(req.query.pageSize);

      const { count, totalPages, visitors } = await visitorService.findAllVisitors(currentPage, pageSize);

      // Check if there are no departments on the current page
      if (visitors.length === 0) {
        logger.info("No data found on this page!")
          return res.status(200).send({
              success: false,
              message: 'No data found on this page!'
          });
        }
      logger.info("All Visitors Fetched Successfully!");
      return res.status(200).send({
          success: true,
          message: "All Visitors Fetched Successfully!",
          data: visitors,
          totalPages,
          count
      });

  } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
          success: false,
          message: error.message
      });
  }
  },

  // Find Single Visitor
  findSingleVisitor: async (req, res) => {
    try {
      const visitorId = req.params.id;
      const visitor = await Visitors.findByPk(visitorId);
      if (!visitor) {
        throw { message: "Visitor Not Found!" }
      }
      const fetchedVisitor = await visitorService.findSingleVisitor(visitorId);

      logger.info(" Visitor Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Visitor Fetched Successfully!",
        data: fetchedVisitor,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  //Update Visitor
  updateVisitor: async (req, res) => {

    try {
      const visitorId = req.params.id;
      const visitor = await Visitors.findByPk(visitorId);
      if (!visitor) {
        throw { message: "Visitor Not Found!" }
      }

      const updatedVisitor = await visitorService.updateVisitor(req, visitorId)
      logger.info("Visitor Updated Successfully!");
      return res.status(200).send({
        success: true,
        message: "Visitor Updated Successfully!",
        data: updatedVisitor,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }


  },

  // Delete Visitor
  deleteVisitor: async (req, res) => {
    try {
      const visitorId = req.params.id;
      const visitor = await Visitors.findByPk(visitorId);
      if (!visitor) {
        throw { message: "Visitor Not Found!" }
      }

      const deletedVisitor = await visitorService.deleteVisitor(visitorId)
      logger.info("Visitor Deleted Successfully!");
      return res.status(200).send({
        success: true,
        message: "Visitor Deleted Successfully!",
        data: deletedVisitor,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })

    }
  }

}

module.exports = visitorController