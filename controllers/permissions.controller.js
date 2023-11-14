
const permissionsService = require('../services/permissions.service')
const logger = require('../common/winston')
const permissionsController = {
// Create and Save a new Permission
createPermission: async (req, res) => {  
  try{
    const permission = await permissionsService.createPermission(req.body);
    logger.info('Permission Created Successfully!');
    return res.status(200).send({
      success: true,
      message: "Permission Created Successfully!",
      data: permission,
      })
  } catch (error) {
    logger.error(error.message);
    return res.status(400).send({
      success: false,
      message: error.message
     
      })
  }
},

// Retrieve All Permissions
findAllPermissions: async(req, res) => {
  try {
    const permissions = await permissionsService.findAllPermissions();
    logger.info('All Permissions Fetched Successfully!');
    return res.status(200).send({
      success: true,
      message: "All Permissions Fetched Successfully!",
      data: permissions,
      })
  } catch (error) {
    logger.error(error.message);
    return res.status(400).send({
      success: false,
      message: error.message
     
      })
  }
},

// Assign Permission to Module
editPermission: async (req, res) => {
  try {
    const result = await permissionsService.editPermission(req.body);
    logger.info('Permission Assigned to Module Successfully!');
    return res.status(200).send({
      success: true,
      message: "Permission Assigned to Module Successfully!",
      data: result,
      })
  } catch (error) {
    logger.error(error.message);
    return res.status(200).send({
      success: false,
      message: error.message,

      })
  }
},
}


module.exports = permissionsController;