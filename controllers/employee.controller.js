
const employeeService = require('../services/employee.service')
const logger = require('../common/winston')
const db = require("../models");
const Employee = db.employees;
const Users = db.users;
const Roles = db.roles;
const Departments = db.departments;
const Designations = db.designations;

const employeeController = {

  // Create An Employee
  createEmployee: async (req, res) => {
    try {
      // Extract specific fields for Users table and the rest for Employee
      const { email, password, userStatus, loginAttempts, fkRoleId, ...employeeData } = req.body;

      const emailExists = await Users.findOne({ where: { email: req.body.email } });

      if (emailExists) {
        throw { message: "Email already exists! Please enter a new email." };
      } else {
        const employee = await employeeService.createEmployee(req.body);
        logger.info('Employee and User Created Successfully!');
        return res.status(200).send({
          success: true,
          message: "Employee and User Created Successfully!",
          data: employee,
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Retrieve All Employees
  findAllEmployees: async (req, res) => {
    try {
      // Parsing query parameters for pagination
      const currentPage = parseInt(req.query.currentPage) ;
      const pageSize = parseInt(req.query.pageSize);

      const { count, totalPages, employees } = await employeeService.findAllEmployees(currentPage, pageSize);

      // Check if there are no departments on the current page
      if (employees.length === 0) {
        logger.info("No data found on this page!")
          return res.status(200).send({
              success: false,
              message: 'No data found on this page!'
          });
        }
      logger.info("All Employees Fetched Successfully!");
      return res.status(200).send({
          success: true,
          message: "All Employees Fetched Successfully!",
          data: employees,
          totalPages,
          count
      });

  } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
          success: false,
          message: error.message
      });
  }
  },

  // Retrieve Single Employee
  findSingleEmployee: async (req, res) => {
    try {
      const employeeId = req.params.id;
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw { message: "Employee Not Found!" }
      }
      const fetchedEmployee = await employeeService.findSingleEmployee(employeeId);
      console.log(fetchedEmployee);

      logger.info(" Employee Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Employee Fetched Successfully!",
        data: fetchedEmployee,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }
  },

  // Update Employee
  updateEmployee: async (req, res) => {

    try {
      const employeeId = req.params.id;
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw { message: "Employee Not Found!" }
      }

      const updatedEmployee = await employeeService.updateEmployee(employee, req)
      logger.info("Employee Updated Successfully!");
      return res.status(200).send({
        success: true,
        message: "Employee Updated Successfully!",
        data: updatedEmployee,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })
    }


  },

  // Delete Employee
  deleteEmployee: async (req, res) => {
    try {
      const employeeId = req.params.id;
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw { message: "Employee Not Found!" }
      }

      const deletedEmployee = await employeeService.deleteEmployee(employee)
      logger.info("Employee Deleted Successfully!");
      return res.status(200).send({
        success: true,
        message: "Employee Deleted Successfully!",
        data: deletedEmployee,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message,

      })

    }
  }

}

module.exports = employeeController