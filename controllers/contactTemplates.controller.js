const contactTemplateService = require('../services/contactTemplates.service');
const logger = require('../common/winston');
const db = require("../models");
const ContactTemplates = db.contactTemplates;
const contactTemplateController = {

  // Create and Save a new ContactTemplate
  createContactTemplate: async (req, res) => {
    try {
      console.log("controller route", req)
      const contactTemplate = await contactTemplateService.createContactTemplate(req.body);
      logger.info("ContactTemplate Created Successfully!");
      return res.status(200).send({
        success: true,
        message: "ContactTemplate Created Successfully!",
        data: contactTemplate,
      })
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrieves All ContactTemplates
  findAllContactTemplates: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      console.log("req", currentPage, pageSize);
      const { count, totalPages, contactTemplate } = await contactTemplateService.findAllContactTemplates(currentPage, pageSize);

      console.log("contact template--->>", contactTemplate)

      if (contactTemplate.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: false,
          message: 'No data found on this page!'
        });
      }
      else {
        logger.info("All contactTemplate Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "All contactTemplate Fetched Successfully!",
          data: { contactTemplate, totalPages, count }
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

  // Retrieve Single ContactTemplate
  findSinlgeContactTemplate: async (req, res) => {
    try {
      const contactTemplateId = req.params.id
      const contactTemplate = await contactTemplateService.findSinlgeContactTemplate(contactTemplateId);
      logger.info("Single contactTemplate Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single contactTemplate Fetched Successfully!",
        data: [contactTemplate],
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Update the contactTemplate
  updateContactTemplate: async (req, res) => {
    try {
      const contactTemplateId = req.params.id;
      const contactTemplate = await ContactTemplates.findByPk(contactTemplateId);
      if (!contactTemplate) {
        return res.status(200).send({
          success: false,
          message: "contactTemplate Not Found!",
          data: null
        })
      }
      const updatedContactTemplate = await contactTemplateService.updateContactTemplate(req, contactTemplateId);
      console.log(updatedContactTemplate)
      logger.info("ContactTemplate Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "ContactTemplate Updated Successfully!",
        data: updatedContactTemplate,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delets/Suspend the ContactTemplate
  deleteContactTemplate: async (req, res) => {
    try {
      const contactTemplateId = req.params.id;
      const contactTemplate = await ContactTemplates.findByPk(contactTemplateId);
      if (!contactTemplate) {
        return res.status(200).send({
          success: false,
          message: "contactTemplate Not Found!",
          data: null
        })
      }
      const deletedContactTemplate = await contactTemplateService.deleteContactTemplate(contactTemplateId);

      logger.info("ContactTemplate Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "ContactTemplate Deleted Successfully!",
        data: deletedContactTemplate,
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

module.exports = contactTemplateController;