const userInventoryService = require("../services/userInventory.service")

const db = require("../models")
const Sessions = db.sessions
const Inventory = db.inventories
const Users = db.users
const Employees = db.employees
const ComplaintTypes = db.complaintTypes
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const userInventoryController = {

    // Issue Product to User/Branch
    issueProductToUser: async (req, res) => {
        try {
            logger.info(`userInventoryController: issueProductToUser id and body ${JSON.stringify(req.params.id, req.body)}`)
            const inventoryId = req.params.id;
            const issuedProduct = await userInventoryService.issueProductToUser(req.body, inventoryId);
            logger.info("Product Issued Successfully!")
            return res.status(200).send({
                success: true,
                message: "Product Issued Successfully!",
                data: issuedProduct,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Return Product From User/Branch
    returnProductFromUser: async (req, res) => {
        try {
            logger.info(`userInventoryController: returnProductFromUser id and body ${JSON.stringify(req.params.id, req.body)}`)
            const inventoryId = req.params.id;
            const returnProduct = await userInventoryService.returnProductFromUser(req.body, inventoryId);
            logger.info("Product Returned Successfully!")
            return res.status(200).send({
                success: true,
                message: "Product Return Successfully!",
                data: returnProduct,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

     // Get Inventory Of User
     getInventoryOfUser: async (req, res) => {
        try {
            logger.info(`userInventoryController: getInventoryOfUser id ${JSON.stringify(req.params.id)}`)
            const userId = req.params.id;
            const userInventory = await userInventoryService.getInventoryOfUser(userId);
            if (userInventory.length === 0) {
                logger.info("No Data Found!")
                return res.status(200).send({
                    success: true,
                    message: "No Data Found",
                    data: [],
                })
            }
            else {
                logger.info("User's Inventory Items Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "User's Inventory Items Fetched Successfully!",
                    data: userInventory,
                })
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve Data
    retrieveUserInventory: async (req, res) => {
        try {
            logger.info(`userInventoryController: retrieveUserInventory`)
            const fetcheduserInventory = await userInventoryService.retrieveUserInventory();
            logger.info("User Inventory Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "User Inventory Fetched Successfully!",
                data: fetcheduserInventory,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Search User Inventory
    searchUserInventory: async (req, res) => {
        try {
            logger.info(`userInventoryController: searchuserInventory query ${JSON.stringify(req.params.query)}`)
            if (Object.keys(req.query).length !== 0) {
                // Assuming the search criteria are passed as query parameters
                const searchCriteria = req.query; // This will be an object with search fields   
                const searchResults = await userInventoryService.searchUserInventory(searchCriteria);
                if (searchResults.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Inventory Search Results!",
                        data: searchResults,
                    });
                } else {
                    logger.info("Data Not Found!");
                    return res.status(200).send({
                        success: true,
                        message: "Data Not Found!",
                        data: searchResults,
                    });
                }
            }
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

   
}


module.exports = userInventoryController