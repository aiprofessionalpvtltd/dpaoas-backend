
const departmentsService = require('../services/departments.service');
const logger = require('../common/winston');
const db = require("../models");
const Departments = db.departments;

const departmentsController = {
  // Create and Save a new Department
  createDepartment: async (req, res) => {
    try {
      logger.info(`departmentsController: createDepartment body ${JSON.stringify(req.body)}`)
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
      logger.info(`departmentsController: findAllDepartments query ${JSON.stringify(req.query)}`)
      // Parsing query parameters for pagination
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, departments } = await departmentsService.findAllDepartments(currentPage, pageSize);
      // Check if there are no departments on the current page
      if (departments.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: true,
          message: 'No data found on this page!'
        });
      }
      logger.info("All Departments Fetched Successfully!");
      return res.status(200).send({
        success: true,
        message: "All Departments Fetched Successfully!",
        data: {
          departments,
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

  // Search Departments
  searchDepartments: async (req, res) => {
    try {
      logger.info(`departmentsController: searchDepartments query ${JSON.stringify(req.query)}`)
      const searchQuery = req.query.search; // Get search query from request parameters
      const queryOptions = {};
      const searchedDepartment = await departmentsService.searchDepartments(searchQuery, queryOptions)
      if (searchedDepartment.length > 0) {
        logger.info("Searched Successfully!");
        return res.status(200).send({
          success: true,
          message: "Departments Search Results!",
          data: searchedDepartment,
        });
      }
      else {
        logger.info("Data Not Found!");
        return res.status(200).send({
          success: true,
          message: "Data Not Found!",
          data: [],
        });
      }

    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  // Retrieve Single Department
  findSingleDepartment: async (req, res) => {
    try {
      logger.info(`departmentsController: findSingleDepartment id ${JSON.stringify(req.params.id)}`)
      const departmentId = req.params.id
      const department = await departmentsService.findSingleDepartment(departmentId);
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
  updateDepartment: async (req, res) => {
    try {
      logger.info(`departmentsController: updateDepartment body ${JSON.stringify(req.body)} and id ${JSON.stringify(req.params.id)}`);
      const departmentId = req.params.id;
      const department = await Departments.findByPk(departmentId);
      if (!department) {
        return res.status(200).send({
          success: true,
          message: "Department Not Found!",
        })
      }
      const updatedDepartment = await departmentsService.updateDepartment(req, departmentId);
      logger.info("Department Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Department Updated Successfully!",
        data: updatedDepartment,
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
  deleteDepartment: async (req, res) => {
    try {
      logger.info(`departmentsController: deleteDepartment id ${JSON.stringify(req.params.id)}`)
      const departmentId = req.params.id;
      const department = await Departments.findByPk(departmentId);
      if (!department) {
        return res.status(200).send({
          success: true,
          message: "Department Not Found!",
        })
      }
      const deletedDepartment = await departmentsService.deleteDepartment(departmentId);
      logger.info("Department Suspend/Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Department Suspend/Deleted Successfully!",
        data: deletedDepartment,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

     //Suspend the Department
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