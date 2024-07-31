const flagService = require('../services/flagService');
const logger = require('../common/winston');
const db = require("../models");
const flags = db.flags;

// Controller method to create a new flag
exports.createFlag = async (req, res) => {
    try {
      // Call the service method to create a flag with the request body
      const response = await flagService.createFlag(req.body);
      
      // If the flag creation was unsuccessful (duplicate flag case)
      if (!response.success) {
        return res.status(400).send({
          success: false,
          message: response.message,
        });
      }
      
      // Return the created flag with a 201 status code
      return res.status(201).send({
        success: true,
        message: response.message,
        data: response.data,
      });
    } catch (err) {
      // Handle any errors and return a 500 status code with the error message
      return res.status(500).send({
        success: false,
        message: "An error occurred while creating the flag",
        error: err.message,
      });
    }
  };
  

// Controller method to retrieve all flags
exports.findAllFlags = async (req, res) => {
    logger.info(`flagsController: findAllFlags`);

    const { query } = req;
    const { page, pageSize } = query;
    const offset = page * pageSize;
    
    // Determine sort order
    let orderType = req.query.order;
    if (orderType === "ascend") {
        orderType = "ASC";
    } else {
        orderType = "DESC";
    }
    const defaultSortColumn = 'id';
    const order = [[defaultSortColumn, orderType]];

    let whereClause = {};
    let options = {};
    
    // Pagination
    if (page && pageSize) {
        options = {
            ...options,
            limit: parseInt(pageSize),
            offset,
        };
    }
    options.order = order;

    try {
        const { rows, count } = await flags.findAndCountAll(options);

        return res.status(200).send({
            success: true,
            message: `All Flags Information fetched successfully`,
            data: { rows, count },
        });
    } catch (error) {
        console.error('Error fetching Flags:', error.message);
        return res.status(400).send({
            success: false,
            message: 'Error fetching Flags',
            error: error.message,
        });
    }
};

// Controller method to retrieve a single flag by ID
exports.findFlagById = async (req, res) => {
    const { id } = req.params;
    
    logger.info(`flagsController: findFlagById - Fetching flag with ID: ${id}`);
  
    try {
      // Call the service method to find a flag by its ID
      const flag = await flagService.findFlagById(id);
  
      // If the flag is not found, return a 404 status code with an error message
      if (!flag) {
        logger.warn(`Flag with ID: ${id} not found`);
        return res.status(404).send({
          success: false,
          message: "Flag not found",
        });
      }
  
      // Return the found flag with a 200 status code
      logger.info(`Flag with ID: ${id} retrieved successfully`);
      return res.status(200).send({
        success: true,
        message: "Flag retrieved successfully",
        data: flag,
      });
    } catch (err) {
      // Handle any errors and return a 500 status code with the error message
      logger.error(`Error occurred while retrieving flag with ID: ${id} - ${err.message}`);
      return res.status(500).send({
        success: false,
        message: "An error occurred while retrieving the flag",
        error: err.message,
      });
    }
  };

// Controller method to update a flag by ID
exports.updateFlag = async (req, res) => {
    try {
      // Call the service method to update a flag with the request body and ID
      const result = await flagService.updateFlag(req.params.id, req.body);
  
      // If the update failed due to specific reasons, handle those cases
    if (!result.success) {
        switch (result.message) {
          case 'Invalid flag data: branchId is required':
            return res.status(400).send({
              success: false,
              message: result.message,
            });
          case 'Flag with the given ID not found':
            return res.status(404).send({
              success: false,
              message: result.message,
            });
          case 'Duplicate flag with the same branchId found':
            return res.status(409).send({
              success: false,
              message: result.message,
            });
          case 'Flag update failed':
            return res.status(400).send({
              success: false,
              message: result.message,
            });
          default:
            return res.status(500).send({
              success: false,
              message: 'An unexpected error occurred',
              error: result.message,
            });
        }
      }
  
      // Return the updated flag with a 200 status code
      return res.status(200).send({
        success: true,
        message: 'Flag updated successfully',
        data: result.data,
      });
    } catch (err) {
      // Handle any unexpected errors and return a 500 status code with the error message
      return res.status(500).send({
        success: false,
        message: 'An error occurred while updating the flag',
        error: err.message,
      });
    }
  };
  

// Controller method to delete a flag by ID
exports.deleteFlag = async (req, res) => {
  try {
    // Call the service method to delete a flag by its ID
    const result = await flagService.deleteFlag(req.params.id);
    // If the flag is not found, return a 404 status code with an error message
    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Flag not found",
      });
    }
    // Return a success message with a 200 status code
    return res.status(200).send({
      success: true,
      message: "Flag deleted successfully",
    });
  } catch (err) {
    // Handle any errors and return a 500 status code with the error message
    return res.status(500).send({
      success: false,
      message: "An error occurred while deleting the flag",
      error: err.message,
    });
  }
};

// Controller method to get flags by branch ID with pagination
exports.getFlagsByBranchId = async (req, res) => {
  try {
    // Extract branchId from request parameters
    const { branchId } = req.params;
    
    // Extract pagination parameters from query
    const { currentPage = 0, pageSize = 10 } = req.query;
    
    // Call the service method to get flags by branchId with pagination
    const response = await flagService.getFlagsByBranchId(branchId, currentPage, pageSize);
    
    // Check if the service response was successful
    if (!response.success) {
      return res.status(400).send({
        success: false,
        message: response.message,
      });
    }

    // Return the flags with a 200 status code
    return res.status(200).send({
      success: true,
      message: response.message,
      data: response.data,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      currentPage: response.currentPage,
    });
  } catch (err) {
    // Handle any errors and return a 500 status code with the error message
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving the flags",
      error: err.message,
    });
  }
};
 
  
