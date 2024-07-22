
const roleService = require('../services/roles.service');

const db = require("../models")
const Roles = db.roles;
const logger = require('../common/winston');
const rolesController = {
  // Create and Save a new Role
  createRole: async (req, res) => {
    try {
      logger.info(`rolesController: createRole body ${JSON.stringify(req.body)}`);
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
      logger.info(`rolesController: findAllRoles query ${JSON.stringify(req.query)}`);
      // Parsing query parameters for pagination
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, roles } = await roleService.findAllRoles(currentPage, pageSize);
      // Check if there are no departments on the current page
      if (roles.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: false,
          message: 'No data found on this page!'
        });
      }
      logger.info("All Roles Fetched Successfully!");
      return res.status(200).send({
        success: true,
        message: "All Roles Fetched Successfully!",
        data: {
          roles,
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

  // Retrieve Single Role
  findSingleRole: async (req, res) => {
    try {
      logger.info(`rolesController: findSingleRole id ${JSON.stringify(req.params.id)}`);
      const roleId = req.params.id;
      const fetchedRole = await roleService.findSingleRole(roleId);
      logger.info("Single Role Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Role Fetched Successfully!",
        data: fetchedRole,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Assign/UnAssign a Permission to a Role and Update Role
  updateRole: async (req, res) => {
    try {
      logger.info(`rolesController: updateRole body ${JSON.stringify(req.body)} and id ${JSON.stringify(req.params.id)}`);
      const roleId = req.params.id;
      const role = await Roles.findByPk(roleId);
      if (!role) {
        return res.status(200).send({
          success: true,
          message: "Role Not Found!"
        })
      }
      // Validate request for adding permissions
      if (req.body.permissionsToUpdate && !Array.isArray(req.body.permissionsToUpdate)) {
        return res.status(200).send({
          success: true,
          message: "permissionsToUpdate must be an array!"
        })
      }
      // Add/Update Permissions
      await roleService.updatePermissions(roleId, req.body.permissionsToUpdate);

      // Update Role
      const updatedRole = await roleService.updateRole(req.body, roleId);
      logger.info("Role updated successfully!");
      return res.status(200).send({
        success: true,
        message: "Role updated successfully!",
        data: updatedRole

      });
      //  }
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      });
    }
  },

  // Inactive The Role
  deleteRole: async (req, res) => {
    try {
      logger.info(`rolesController: deleteRole id ${JSON.stringify(req.params.id)}`);
      const roleId = req.params.id;
      const role = await Roles.findByPk(roleId);
      if (!role) {
        return res.status(200).send({
          success: true,
          message: "Role Not Found!"
        })
      }
      const deletedRole = await roleService.deleteRole(roleId);
      logger.info("Role Suspend/Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Role Suspend/Deleted Successfully!",
        data: deletedRole,
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