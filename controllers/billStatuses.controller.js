const billStatusService = require('../services/billStatuses.service');
const logger = require('../common/winston');
const db = require("../models");
const BillStatuses = db.billStatuses;
const BillStatusController = {

  // Create a new Bill Status
  createBillStatus: async (req, res) => {
    try {
      const billStatus = await billStatusService.createBillStatus(req.body);
      logger.info("bill Status Created Successfully!");
      return res.status(200).send({
        success: true,
        message: "bill Status Created Successfully!",
        data: billStatus,
      })
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrieves All Bill Status
  findAllBillStatuses: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, billStatus } = await billStatusService.findAllBillStatuses(currentPage, pageSize);

      if (billStatus.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: false,
          message: 'No data found on this page!'
        });
      }
      else {
        logger.info("All bill Statuses Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "All bill Statuses Fetched Successfully!",
          data: { billStatus, totalPages, count }
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

  // Retrieve Single bill Status
  findSinlgeBillStatus: async (req, res) => {
    try {
      const billStatusId = req.params.id
      const billStatus = await billStatusService.findSinlgeBillStatus(billStatusId);
      logger.info("Single bill Status Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single bill Status Fetched Successfully!",
        data: [billStatus],
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Update the Bill Status
  updateBillStatus: async (req, res) => {
    try {
      const billStatusId = req.params.id;
      const billStatus = await BillStatuses.findByPk(billStatusId);
      if (!billStatus) {
        return res.status(200).send({
          success: false,
          message: "Bill Status Not Found!",
          data: null
        })
      }
      const updatedBillStatus = await billStatusService.updateBillStatus(req, billStatusId);
      logger.info("Bill Status Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Bill Status Updated Successfully!",
        data: updatedBillStatus,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delets/Suspend the Bill Status
  deleteBillStatus: async (req, res) => {
    try {
      const billStatusId = req.params.id;
      const billStatus = await BillStatuses.findByPk(billStatusId);
      if (!billStatus) {
        return res.status(200).send({
          success: false,
          message: "Bill Status Not Found!",
          data: null
        })
      }
      const deletedBillStatus = await billStatusService.deleteBillStatus(billStatusId);

      logger.info("Bill Status Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Bill Status Deleted Successfully!",
        data: deletedBillStatus,
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

module.exports = BillStatusController;