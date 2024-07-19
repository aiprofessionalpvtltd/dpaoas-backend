const inventoryBillsService = require("../services/inventoryBills.service")
const db = require("../models")
const Sessions = db.sessions
const Inventory = db.inventories
const InventoryBills = db.inventoryBills
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const inventoryBillsController = {

    
    // Create Inventory Bill
    createInventoryBill: async(req,res) =>
    {
      try {
        logger.info(`inventoryBillsController: createInventoryBill body ${JSON.stringify(req.body)}`)
        // Prepare the update object
        let updateData = req.body;
        // Check if there's a file to be uploaded
        if (req.file) {
            const path = req.file.destination.replace('./public/', '/public/') + '/' + req.file.originalname;
            updateData.invoiceAttachment = path;
        }
        const inventoryBill = await inventoryBillsService.createInventoryBill(updateData);
        return res.status(200).send({
            success: true,
            message: "Inventory Bill Created Successfully!",
            data: inventoryBill,
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send({
            success: false,
            message: error.message,
        });
    }
    },
    // Search Inventory Bill
    searchInventoryBill: async (req, res) => {
        try {
            logger.info(`inventoryBillsController: searchInventoryBill query ${JSON.stringify(req.query)}`)
            if (Object.keys(req.query).length !== 0) {
                // Assuming the search criteria are passed as query parameters
                const searchCriteria = req.query; // This will be an object with search fields   
                const searchResults = await inventoryBillsService.searchInventoryBill(searchCriteria);
                if (searchResults.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Inventory Bill Search Results!",
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

    //Retrive All Inventory Bills
    getAllInventoryBills: async (req, res) => {
        try {
            logger.info(`inventoryBillsController: geAllInventoryBills id${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, inventoryBills } = await inventoryBillsService.getAllInventoryBills(currentPage, pageSize);
            // Check if there are no inventories on the current page
            if (inventoryBills.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Inventory Bills Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Inventory Bills Fetched Successfully!",
                data: {
                    inventoryBills,
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

    // Get Single Inventory Bill
    getSingleInventoryBill: async (req, res) => {
        try {
            logger.info(`inventoryController: getSingleInventoryBill id ${JSON.stringify(req.params.id)}`)
            const inventoryBillId = req.params.id;
            const fetchedInventoryBill = await inventoryBillsService.getSingleInventoryBill(inventoryBillId);
            logger.info("Single Inventory Bill Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Inventory Bill Fetched Successfully!",
                data: fetchedInventoryBill,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Update Inventory Bill
    updateInventoryBill: async(req,res) => 
    {
        try {
            logger.info(`inventoryController: updateInventoryBill id and body${JSON.stringify(req.params.id,req.params.id)}`)
            const inventoryBillId = req.params.id;
            const inventoryBill = await InventoryBills.findByPk(inventoryBillId);
            if (!inventoryBill) {
              throw ({ message: "Inventory Bill Not Found!" });
            }
            const updatedBill = await inventoryBillsService.updateInventoryBill(req.body, inventoryBillId);
            if (updatedBill) {
              if (req.file) {
                const path = req.file.destination.replace('./public/', '/public/')
                try {
                  // Your code to update the database
                  await InventoryBills.update(
                    {
                      invoiceAttachment: `${path}/${req.file.originalname}`,
                    },
                    {
                      where: { id: inventoryBillId }
                    }
                  );
                } catch (error) {
                  logger.info("Error Updating Attachment");
                  return res.status(400).send({
                    success: false,
                    message: error.message,
                  })
                }
              }
              const updatedBill = await InventoryBills.findOne({ where: { id: inventoryBillId } });
              logger.info("Inventory Bill Updated Successfully!")
              return res.status(200).send({
                success: true,
                message: "Inventory Bill Updated Successfully!",
                data: updatedBill,
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

    // Delete Inventory Bill
    deleteInventoryBill: async (req, res) => {
        try {
            logger.info(`inventoryBillsController: deleteInventoryBill id ${JSON.stringify(req.params.id)}`)
            const inventoryBillId = req.params.id;
            const inventoryBill = await InventoryBills.findByPk(inventoryBillId);
            if (!inventoryBill) {
                throw ({ message: "Inventory Bill Not Found!" });
            }
            const deletedBill = await inventoryBillsService.deleteInventoryBill(inventoryBillId);
            logger.info("Inventory Bill Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Inventory Bill Deleted Successfully!",
                data: deletedBill,
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


module.exports = inventoryBillsController