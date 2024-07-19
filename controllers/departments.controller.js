
const departmentsService = require('../services/departments.service');
const logger = require('../common/winston');
const departmentsController = {
// Create and Save a new Department
createDepartment: async (req, res) => {
  try {
    const department = await departmentsService.createDepartment(req.body);
    logger.info("Department Created Successfully!")
    return res.status(200).send({
      success: true,
      message: "Department Created Successfully!",
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

// Retrieve All Departments
findAllDepartments: async (req, res) => {
  try {
    const departments = await departmentsService.findAllDepartments(req);

    // Check if search query was provided
    if (req.query.search) {
      logger.info("Searched Successfully");
      return res.status(200).send({
        success: true,
        message: "Departments Search Results",
        data: departments,
      });
    } else {
      logger.info("All Departments Fetched Successfully!");
      return res.status(200).send({
        success: true,
        message: "All Departments Fetched Successfully!",
        data: departments,
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

    // Retrieve Single Department
    findSinlgeDepartment: async (req,res) =>{
        try {
            const department = await departmentsService.findSingleDepartment(req);
            logger.info("Single Department Fetched Successfully!")
            return res.status(200).send({
              success: true,
              message: "Single Department Fetched Successfully!",
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

    // Updates the Department
    updateDepartment: async(req,res) =>
    {
        try {
            const department = await departmentsService.updateDepartment(req);
            console.log(department)
            logger.info("Single Department Updated Successfully!")
            return res.status(200).send({
              success: true,
              message: "Single Department Updated Successfully!",
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

     // Delets/Suspend the Department
     suspendDepartment: async(req,res) =>
     {
         try {
             const department = await departmentsService.suspendDepartment(req);
             console.log(department)
             logger.info("Single Department Suspend/Deleted Successfully!")
             return res.status(200).send({
               success: true,
               message: "Single Department Suspend/Deleted Successfully!",
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

}

module.exports = departmentsController;