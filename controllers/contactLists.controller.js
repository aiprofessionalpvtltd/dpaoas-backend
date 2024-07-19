const contactListService = require('../services/contactLists.service');
const logger = require('../common/winston');
const db = require("../models");
const ContactLists = db.contactLists;
const contactListsController = {
    // Create and Save a new contactList
    createContactList: async (req, res) => {
        try {
            console.log("controller route", req)
            const contactList = await contactListService.createContactList(req.body);
            logger.info("contactList Created Successfully!");
            return res.status(200).send({
                success: true,
                message: "contactList Created Successfully!",
                data: contactList,
            })
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieves All contactList
    findAllContactList: async (req, res) => {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            console.log("req", currentPage, pageSize);
            const { count, totalPages, contactList } = await contactListService.findAllContactList(currentPage, pageSize);

            console.log("contact contactList--->>", contactList)

            if (contactList.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            else {
                logger.info("All contactList Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "All contactList Fetched Successfully!",
                    data: { contactList, totalPages, count }
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

    // Retrieve Single contactList
    findSinlgeContactList: async (req, res) => {
        try {
            const contactListId = req.params.id
            const contactList = await contactListService.findSinlgeContactList(contactListId);
            logger.info("Single contactList Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single contactList Fetched Successfully!",
                data: [contactList],
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update the contactList
    updateContactList: async (req, res) => {
        try {
            const contactListId = req.params.id;
            const contactList = await ContactLists.findByPk(contactListId);
            if (!contactList) {
                return res.status(200).send({
                    success: false,
                    message: "contactList Not Found!",
                    data: null
                })
            }
            const updatedContactList = await contactListService.updateContactList(req, contactListId);
            console.log(updatedContactList)
            logger.info("contactList Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "contactList Updated Successfully!",
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Delets/Suspend the contactList
    deleteContactList: async (req, res) => {
        try {
            const contactListId = req.params.id;
            const contactList = await ContactLists.findByPk(contactListId);
            if (!contactList) {
                return res.status(200).send({
                    success: false,
                    message: "contactList Not Found!",
                    data: null
                })
            }
            const deletedContactList = await contactListService.deleteContactList(contactListId);

            logger.info("ContactList Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "ContactList Deleted Successfully!",
                data: deletedContactList,
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

module.exports = contactListsController;