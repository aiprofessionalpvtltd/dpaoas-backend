const vendorsService = require("../services/vendor.service")
const db = require("../models")
const Sessions = db.sessions
const Vendors = db.vendors
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const vendorsController = {

    // Create Vendor 
    createVendor: async (req, res) => {
        try {
            logger.info(`vendorsController: createVendor body ${JSON.stringify(req.body)}`)

            const vendor = await vendorsService.createVendor(req.body);
            logger.info("Vendor Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Vendor Created Successfully!",
                data: vendor,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Vendors
    getAllVendors: async (req, res) => {
        try {
            logger.info(`vendorsController: getAllVendors query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, vendors } = await vendorsService.getAllVendors(currentPage, pageSize);
            // Check if there are no inventories on the current page
            if (vendors.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Vendors Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Vendors Fetched Successfully!",
                data: {
                    vendors,
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

    // Search Vendor
    searchVendor: async (req, res) => {
        try {
            logger.info(`vendorsController: searchVendor query ${JSON.stringify(req.query)}`)
            if (Object.keys(req.query).length !== 0) {
                // Assuming the search criteria are passed as query parameters
                const searchCriteria = req.query; // This will be an object with search fields   
                const searchResults = await vendorsService.searchVendor(searchCriteria);
                if (searchResults.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Vendor Search Results!",
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
    // Retrive Single Vendor
    getSingleVendor: async (req, res) => {
        try {
            logger.info(`vendorsController: searchVendor id ${JSON.stringify(req.params.id)}`)
            const vendorId = req.params.id;
            const fetchedVendor = await vendorsService.getSingleVendor(vendorId);
            logger.info("Single Vendor Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Vendor Fetched Successfully!",
                data: fetchedVendor,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Vendor
    updateVendor: async (req, res) => {
        try {
            logger.info(`vendorsController: updateVendor id and body ${JSON.stringify(req.params.id, req.body)}`)
            const vendorId = req.params.id;
            const vendor = await Vendors.findByPk(vendorId);
            if (!vendor) {
                throw ({ message: "Vendor Not Found!" });
            }
            const updatedVendor = await vendorsService.updateVendor(req.body, vendorId);
            logger.info("Vendor Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Vendor Updated Successfully!",
                data: updatedVendor,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    // Delete Vendor
    deleteVendor: async (req, res) => {
        try {
            logger.info(`vendorsController: deleteVendor id ${JSON.stringify(req.params.id)}`)
            const vendorId = req.params.id;
            const vendor = await Vendors.findByPk(vendorId);
            if (!vendor) {
                throw ({ message: "Vendor Not Found!" });
            }
            const deletedVendor = await vendorsService.deleteVendor(vendorId);
            logger.info("Vendor Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Vendor Deleted Successfully!",
                data: deletedVendor,
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


module.exports = vendorsController