
const designationsService = require('../services/designations.service');
const logger = require('../common/winston');

const designationsController = {
// Create and Save a new Designation
createDesignation: async (req, res) => {
  try {
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
    const designations = await designationsService.findAllDesignations(req);

    // Check if search query was provided
    if (req.query.search) {
      logger.info("Searched Successfully");
      return res.status(200).send({
        success: true,
        message: "Designations Search Results",
        data: designations,
      });
    } else {
      logger.info("All Designations Fetched Successfully!");
      return res.status(200).send({
        success: true,
        message: "All Designations Fetched Successfully!",
        data: designations,
      });
    }

  } catch (error) {
    logger.error(error.message);
    return res.status(400).send({
      success: false,
      message: error.message
    });
  }
},

// Retrieve Single Designation
findSinlgeDesignation: async (req,res) =>{
    try {
        const designation = await designationsService.findSingleDesignation(req);
        logger.info("Single Designation Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "Single Designation Fetched Successfully!",
          data: department,
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
updateDesignation: async(req,res) =>
{
    try {
        const designation = await designationsService.updateDesignation(req);     
        logger.info("Designation Updated Successfully!")
        return res.status(200).send({
          success: true,
          message: "Designation Updated Successfully!",
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

 // Delets/Suspend the Designation
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