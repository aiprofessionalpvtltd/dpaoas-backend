const parliamentaryYearsService = require("../services/parliamentaryYears.service")
const db = require("../models")
const ParliamentaryYears = db.parliamentaryYears
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const parliamentaryYearsController = {

    // Create Parliamentary Year 
    createParliamentaryYear: async(req,res) =>
    {
        try {
            logger.info(`parliamentaryYearsController: createParliamentaryYear body ${JSON.stringify(req.body)}`)
            const parliamentaryYear = await parliamentaryYearsService.createParliamentaryYear(req.body);
            logger.info("Parliamentary Year Created Successfully!")
            return res.status(200).send({
              success: true,
              message: "Parliamentary Year Created Successfully!",
              data: parliamentaryYear,
              })
          } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
              success: false,
              message: error.message
              })
          }
    },

    //Retrive All Parliamentary Years
    getAllParliamentaryYears: async(req,res)=>
    {
        try {
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            logger.info(`parliamentaryYearsController: getAllParliamentaryYears query ${JSON.stringify(req.query)}`)
            const { count, totalPages, parliamentaryYears } = await parliamentaryYearsService.getAllParliamentaryYears(currentPage,pageSize);
            // Check if there are no parliamentary years on the current page
            if (parliamentaryYears.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!'
                });
            }
            logger.info("Parliamentary Years Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Parliamentary Years Fetched Successfully!",
                data: parliamentaryYears,
                totalPages,
                count
            });

          } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
              success: false,
              message: error.message
              })
          }
    },

    // Retrive Single Parliamentary Year
    getSingleParliamentaryYear: async(req,res) =>
    {
        try {
            logger.info(`parliamentaryYearsController: getSingleParliamentaryYear id ${JSON.stringify(req.params.id)}`)
            const parliamentaryYearId = req.params.id;
            const fetchedParliamentaryYear = await parliamentaryYearsService.getSingleParliamentaryYear(parliamentaryYearId);
            logger.info("Single Parliamentary Year Fetched Successfully!")
            return res.status(200).send({
              success: true,
              message: "Single Parliamentary Year Fetched Successfully!",
              data: fetchedParliamentaryYear,
              })
          } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
              success: false,
              message: error.message
              })
          }
    },

    //Update Parliamentary Year
    updateParliamentaryYear: async(req,res) =>
    {
        try{
            logger.info(`parliamentaryYearsController: updateParliamentaryYear body ${JSON.stringify(req.body)}`)
            const parliamentaryYearId = req.params.id;
            const parliamentaryYear = await ParliamentaryYears.findByPk(parliamentaryYearId);
            if (!parliamentaryYear)
            {
                return res.status(200).send({
                    success: true,
                    message: "Parliamentary Year Not Found!",
                })
            }     
        const updatedParliamentaryYear = await parliamentaryYearsService.updateParliamentaryYear(req.body,parliamentaryYearId);
        logger.info("Parliamentary Year Updated Successfully!")
        return res.status(200).send({
          success: true,
          message: "Parliamentary Year Updated Successfully!",
          data: updatedParliamentaryYear,
          })
      } catch (error) {
        logger.error(error.message)
        return res.status(400).send({
          success: false,
          message: error.message
          })
      }

    },

    // Delete Parliamentary Year
    deleteParliamentaryYear: async(req,res) =>
    {
        try{
            logger.info(`parliamentaryYearsController: deleteParliamentaryYear id ${JSON.stringify(req.params.id)}`)
            const parliamentaryYearId = req.params.id;
            const parliamentaryYear = await ParliamentaryYears.findByPk(parliamentaryYearId);
            if (!parliamentaryYear)
            {
                return res.status(200).send({
                    success: true,
                    message: "Parliamentary Year Not Found!",
                })
            }
        const deletedParliamentaryYear = await parliamentaryYearsService.deleteParliamentaryYear(parliamentaryYearId);
        logger.info("Parliamentary Year Deleted Successfully!")
        return res.status(200).send({
          success: true,
          message: "Parliamentary Year Deleted Successfully!",
          data: deletedParliamentaryYear,
          })
      } catch (error) {
        logger.error(error.message)
        return res.status(400).send({
          success: false,
          message: error.message
          })
      }

    },
    
     // Retrieve Records by Tenure ID
getRecordsByTenureId: async (req, res) => {
    try {
      logger.info(`parliamentaryYearsController: getRecordsByTenureId tenureID ${JSON.stringify(req.params.tenureID)}`);
      
        const tenureID = req.params.id;
     
      const records = await parliamentaryYearsService.getRecordsByTenureId(tenureID);
  
      if (records.length === 0) {
        logger.info("No records found for the provided Tenure ID.");
        return res.status(404).send({
          success: false,
          message: "No records found for the provided Tenure ID.",
        });
      }
  
       logger.info("Records Fetched Successfully!");
      return res.status(200).send({
        success: true,
        message: "Records Fetched Successfully!",
        data: records,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },
  

}


module.exports = parliamentaryYearsController
