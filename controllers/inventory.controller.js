const inventoryService = require("../services/inventory.service")
const db = require("../models")
const Sessions = db.sessions
const Inventory = db.inventories
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const inventoryController = {

    // Create Inventory 
    createInventory: async (req, res) => {
        try {
            logger.info(`inventoryController: createInventory body ${JSON.stringify(req.body)}`)
            const inventory = await inventoryService.createInventory(req.body);
            logger.info("Inventory Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Inventory Created Successfully!",
                data: inventory,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Search Inventory
    searchInventory: async (req, res) => {
        try {
            logger.info(`inventoryController: searchInventory query ${JSON.stringify(req.query)}`)
            if (Object.keys(req.query).length !== 0) {
                // Assuming the search criteria are passed as query parameters
                const searchCriteria = req.query; // This will be an object with search fields   
                const searchResults = await inventoryService.searchInventory(searchCriteria);
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

    //Retrive All Inventory Products
    geAllInventories: async (req, res) => {
        try {
            logger.info(`inventoryController: geAllInventories id${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, inventories } = await inventoryService.geAllInventories(currentPage, pageSize);
            // Check if there are no inventories on the current page
            if (inventories.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Inventory Products Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Inventory Products Fetched Successfully!",
                data: {
                    inventories,
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

    // Get Single Inventory
    getSingleInventory: async (req, res) => {
        try {
            logger.info(`inventoryController: getSingleInventory id ${JSON.stringify(req.params.id)}`)
            const inventoryId = req.params.id;
            const fetchedInventory = await inventoryService.getSingleInventory(inventoryId);
            logger.info("Single Inventory Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Inventory Fetched Successfully!",
                data: fetchedInventory,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update Inventory
    updateInventory: async(req,res) =>
    {
        try{
            logger.info(`inventoryController: updateInventory id and body ${JSON.stringify(req.params.id, req.body)}`)
            const inventoryId = req.params.id;
            const inventory = await Inventory.findByPk(inventoryId);
            if (!inventory)
            {
                throw ({message: "Inventory Not Found!"});
            }
        const updatedInventory = await inventoryService.updateInventory(req.body,inventoryId);
        logger.info("Inventory Items Updated Successfully!")
        return res.status(200).send({
          success: true,
          message: "Inventory Items Updated Successfully!",
          data: updatedInventory,
          })
      } catch (error) {
        logger.error(error.message)
        return res.status(400).send({
          success: false,
          message: error.message
          })
      }

    },
    // Delete Inventory 
    deleteInventory: async (req, res) => {
        try {
            logger.info(`inventoryController: updateInventory id and body ${JSON.stringify(req.params.id, req.body)}`)
            const inventoryId = req.params.id;
            const inventory = await Inventory.findByPk(inventoryId);
            if (!inventory) {
                throw ({ message: "Inventory Not Found!" });
            }
            const deletedInventory = await inventoryService.deleteInventory(inventoryId);
            logger.info("Inventory Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Inventory Deleted Successfully!",
                data: deletedInventory,
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


module.exports = inventoryController