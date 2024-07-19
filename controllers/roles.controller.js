
const roleService = require('../services/roles.service');
const logger = require('../common/winston');
const rolesController = {
// Create and Save a new Role
createRole: async (req, res) => {
  try {
    const role = await roleService.createRole(req.body);
    logger.info("Role Created Successfully!")
    return res.status(200).send({
      success: true,
      message: "Role Created Successfully!",
      data: role,
      })
  } catch (error) {
    logger.error(error.message)
    return res.status(400).send({
      success: false,
      message: error.message
      })
  }
},

// Retrieve All Roles
findAllRoles: async (req, res) => {
  try {
    const roles = await roleService.findAllRoles();
    logger.info("All Roles Fetched Successfully!")
    return res.status(200).send({
      success: true,
      message: "All Roles Fetched Successfully!",
      data: roles,
      })
  } catch (error) {
    logger.error(error.message)
    return res.status(400).send({
      success: false,
      message: error.message
      })
  }
},

// Assign a permission to a role
editRole: async (req, res) => {
  try {
    const result = await roleService.editRole(req.body);
    logger.info("Permission Assigned to Role Successfully!")
    return res.status(200).send({
      success: true,
      message: "Permission Assigned to Role Successfully!",
      data: result,
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

module.exports = rolesController;