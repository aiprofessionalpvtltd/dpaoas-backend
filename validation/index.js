// User
const createEmployeeValidator = require('./employeeValidation');
// RBAC
const createRoleValidator = require('./rbacValidation')

//Departments-Designations
const createDepartmentValidator = require('./departDesigValidation')
const createDesignationValidator = require('./departDesigValidation')

//VMS
const createVMSValidator = require('./vmsValidation')
  
const createQuestionValidator = require('./questionValidation')

const createUserValidation = require('./userValidation');

module.exports = {
  createEmployeeValidator,
  createDepartmentValidator,
  createDesignationValidator,
  createRoleValidator,
  createVMSValidator,
  createQuestionValidator,
  createUserValidation,
};