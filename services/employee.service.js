const { where, sequelize } = require("sequelize");
// const { QueryTypes } = require('sequelize');
const db = require("../models");
const Branches = db.branches
const Users = db.users;
const Roles = db.roles;
const Employee = db.employees;
const Departments = db.departments;
const Designations = db.designations;


const bcrypt = require('bcrypt');

const employeeService = {

  // // Create Employee
  // createEmployee: async (req) => {
  //   const transaction = await db.sequelize.transaction();
  //   try {

  //     // Hash the password
  //     const salt = await bcrypt.genSalt(10);
  //     const hashedPassword = await bcrypt.hash(req.password, salt);

  //     // Prepare the data for Users table
  //     const userData = {
  //       email: req.email,
  //       password: hashedPassword,
  //       userStatus: "active",
  //       loginAttempts: 3,
  //       fkRoleId: req.fkRoleId,
  //     };

  //     console.log("user data---->.", JSON.stringify(userData))

  //    // Get the highest existing user ID and increment it
  //    const maxUserId = await Users.max('id', { transaction }) || 0;
  //    const nextUserId = maxUserId + 1;
  //    console.log("Next user id---->.", nextUserId);

  //    // Set the new user's ID to the next available ID
  //    userData.id = nextUserId;

  //    // Create the User
  //    const user = await Users.create(userData, { transaction });
  //    console.log("user**********", user);
  //    const userId = user.id;

  //    console.log("user id $$$4", userId);
  //     // Ensure userId is valid
  //     if (!userId) {
  //       throw new Error("Failed to create User");
  //     }

  //     // Create Employee
  //     const maxEmployeeId = await Employee.max('id', { transaction }) || 0; // Get max id or default to 0
  //     const nextEmployeeId = maxEmployeeId + 1;
  //     console.log("nextEmployeeIdid0----", nextEmployeeId);


  //     const employeeData = {
  //       id: nextEmployeeId,
  //       firstName: req.firstName,
  //       lastName: req.lastName,
  //       userName: req.userName,
  //       phoneNo: req.phoneNo,
  //       gender: req.gender,
  //       fileNumber: req.fileNumber,
  //       profileImage: req.profileImage,
  //       supervisor: req.supervisor,
  //       userType: req.userType,
  //       reportingTo: req.reportingTo,
  //       fkUserId: userId,
  //       fkDepartmentId: req.fkDepartmentId ? req.fkDepartmentId : null,
  //       fkDesignationId: req.fkDesignationId,
  //       fkBranchId: req.fkBranchId,
  //     };


  //     console.log("employeeData----------", employeeData);

  //     // Create the Employee
  //     const employee = await Employee.create(employeeData, { transaction });

  //     await transaction.commit(); // Commit the transaction
  //     // Return the created employee
  //     return employee;

  //   } catch (error) {
  //     await transaction.rollback(); // Rollback the transaction in case of error
  //     console.error("Error creating employee: ", error);
  //     throw { message: error.message || "Error Creating Employee!" };
  //   }
  // },

  // // Create Employee
  // createEmployee: async (req) => {
  //   try {

  //     console.log("Creating Employee", req)
  //     // Hash the password
  //     const salt = await bcrypt.genSalt(10);
  //     const hashedPassword = await bcrypt.hash(req.password, salt);

  //   // Prepare the data for Users table
  //   const userData = {
  //     email: req.email,
  //     password: hashedPassword,
  //     userStatus: "active",
  //     loginAttempts: 3,
  //     fkRoleId: req.fkRoleId,
  //   };

  //     // Create the User
  //     const user = await Users.create(userData);
  //     const userId = user.id;

  //     console.log("user - id" ,userId);


  //      // Prepare data for Employee table, including the User's ID
  //   const employeeData = {
  //     firstName: req.firstName,
  //     lastName: req.lastName,
  //     userName: req.userName,
  //     phoneNo: req.phoneNo,
  //     gender: req.gender,
  //     fileNumber: req.fileNumber,
  //     supervisor: req.supervisor,
  //     fkUserId: userId, // Set the foreign key to the User's ID
  //     fkDesignationId: req.fkDesignationId,
  //     fkBranchId: req.fkBranchId,
  //     userType : req.userType || null,
  //     reportingTo : req.reportingTo || null
  //   };

  //   // Create the Employee
  //   const employee = await Employee.create(employeeData);
  //     // Return the created employee
  //     return employee;

  //   } catch (error) {
  //     if (error.errors) {
  //       error.errors.forEach(err => {
  //         console.error("Validation error:", err.message, "Field:", err.path, "Value:", err.value);
  //       });
  //     }
  //     console.error("Error Creating Employee:", error);
  //     throw { message: error.message || "Error Creating Employee!" };
  
  //   }
  // },

  createEmployee: async (req) => {
    const transaction = await db.sequelize.transaction();

    try {
      console.log("Creating Employee", req);
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.password, salt);
  
      // Prepare the data for Users table
      const userData = {
        email: req.email,
        password: hashedPassword,
        userStatus: "active",
        loginAttempts: 3,
        fkRoleId: req.fkRoleId,
      };
  
      // Create the User within a transaction
      const user = await Users.create(userData, { transaction });
      const userId = user.id;
  
      console.log("user - id", userId);
  
      // Prepare data for Employee table, including the User's ID
      const employeeData = {
        firstName: req.firstName,
        lastName: req.lastName,
        userName: req.userName,
        phoneNo: req.phoneNo,
        gender: req.gender,
        fileNumber: req.fileNumber,
        supervisor: req.supervisor,
        fkUserId: userId, // Set the foreign key to the User's ID
        fkDesignationId: req.fkDesignationId,
        fkBranchId: req.fkBranchId,
        userType: req.userType || null,
        reportingTo: req.reportingTo || null,
      };
  
      // Create the Employee within a transaction
      const employee = await Employee.create(employeeData, { transaction });
  
      // Commit the transaction
      await transaction.commit();
  
      // Return the created employee
      return employee;
  
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
  
      if (error.errors) {
        error.errors.forEach(err => {
          console.error("Validation error:", err.message, "Field:", err.path, "Value:", err.value);
        });
      }
      console.error("Error Creating Employee:", error);
      throw { message: error.message || "Error Creating Employee!" };
    }
  },

  // Retrieve All Employees
  findAllEmployees: async (currentPage, pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;
      
      const { count, rows } = await Employee.findAndCountAll({
        include: [
          {
            model: Departments,
            as: 'departments',
            attributes: ['id', 'departmentName'],
          },
          {
            model: Designations,
            as: 'designations',
            attributes: ['id', 'designationName'],
          },
          {
            model: Branches,
            as: 'branches',
            attributes: ['id', 'branchName'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'email'],
            include: [
              {
                model: Roles,
                as: 'role',
                attributes: ['id', 'name'],
              }
            ]
          }
        ],
        offset,
        limit,
        where: { employeeStatus: 'active' },
        order: [['firstName', 'ASC']]
      });
      
      const totalPages = Math.ceil(count / pageSize);
      return { count, totalPages, employees: rows };
    } catch (error) {
      throw new Error(error.message || "Error Fetching All Employees");
    }
  },
  

  // Retrieve Single Employee
  findSingleEmployee: async (employeeId) => {
    try {
      const fetchedEmployee = await Employee.findOne({
        where: { id: employeeId },
        include: [
          {
            model: Departments,
            as: 'departments',
            attributes: ['id', 'departmentName'],
          },
          {
            model: Designations,
            as: 'designations',
            attributes: ['id', 'designationName'],
          },
          {
            model: Branches,
            as: 'branches',
            attributes: ['id', 'branchName'],
          },
          {
            model: Users,
            as: 'users',
            attributes: ['id', 'email'],
            include: [
              {
                model: Roles,
                as: 'role',
                attributes: ['id', 'name'],
              }
            ]
          }
        ]
      });
      return fetchedEmployee;
    } catch (error) {
      throw { message: error.message || "Error Fetching Employee!" }
    }

  },

// // Update Employee
// updateEmployee: async (employee, req) => {
//   const { firstName, lastName, userName, phoneNo, gender, email, fileNumber, supervisor, fkRoleId, fkBranchId, fkDesignationId, fkDepartmentId } = req.body;

//   const transaction = await db.sequelize.transaction();

//   try {
//     // Update User data
//     await Users.update({
//       email,
//       // password, // Ensure to hash if updating password
//       userStatus: "active", // You can update userStatus here if needed
//       fkRoleId,
//     }, {
//       where: { id: employee.fkUserId }, // Use the foreign key to find the User
//       transaction,
//     });

//     // Update Employee data
//     await Employee.update({
//       firstName,
//       lastName,
//       userName,
//       phoneNo,
//       gender,
//       fileNumber,
//       supervisor,
//       fkRoleId,
//       fkBranchId,
//       fkDesignationId,
//       fkDepartmentId,
//     }, {
//       where: { id: employee.id },
//       transaction,
//     });

//     await transaction.commit(); // Commit the transaction

//     // Fetch and return the updated Employee data
//     const updatedEmployee = await Employee.findByPk(employee.id, {
//       include: [{ model: Users, as: 'users' }],
//     });

//     return updatedEmployee;
//   } catch (error) {
//     await transaction.rollback(); // Rollback the transaction in case of error
//     console.error("Error updating employee: ", error);
//     throw { message: error.message || "Error Updating Employee!" };
//   }
// },

// Update Employee
updateEmployee: async (employee, req) => {
  try {
    const t = await db.sequelize.transaction();

    try {
      const userPayload = {
        email: req.body.email,
        // password: req.body.password,
        fkRoleId: req.body.fkRoleId
      };

      // Update the User
      await db.users.update(userPayload, { where: { id: employee.fkUserId }, transaction: t });

      const employeePayload = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        phoneNo: req.body.phoneNo,
        gender: req.body.gender,
        fileNumber: req.body.fileNumber,
        supervisor: req.body.supervisor,
        fkBranchId: req.body.fkBranchId,
        fkDesignationId: req.body.fkDesignationId
      };

      // Update the Employee
      await Employee.update(employeePayload, { where: { id: employee.id }, transaction: t });

      await t.commit();

      const updatedEmployee = await Employee.findByPk(employee.id, { include: ['users'] });
      return updatedEmployee;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    throw { message: error.message || "Error Updating Employee!" };
  }
},



  // Delete the Employee
  deleteEmployee: async (employee) => {
    try {
      const userId = employee.fkUserId;
  
      // Update the employee status to inactive
      const deletedEmployeeData = {
        employeeStatus: 'inactive',
      };
      await Employee.update(deletedEmployeeData, { where: { id: employee.id } });
  
      // Update the user status to inactive
      const deletedUserData = {
        userStatus: 'inactive',
      };
      await Users.update(deletedUserData, { where: { id: userId } });
  
      const updatedEmployee = await Employee.findByPk(employee.id);
      const updatedUser = await Users.findByPk(userId);
  
      return { updatedEmployee, updatedUser };
    } catch (error) {
      throw { message: error.message || 'Error Deleting Employee!' };
    }
  }  
}

module.exports = employeeService