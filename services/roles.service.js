const db = require("../models");
const Roles = db.roles;
const Permissions = db.permissions;
const Modules = db.modules;
const RolesPermissions = db.rolesPermissions;
//const ModulesRolesPermissions = db.modules_roles_permissions;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const rolesService = {
    // Create A New Role
    createRole : async(req) => {
        try {
            // Validate the role data
            if (!req.name) {
              throw({ message: 'Please Provide Name!'})
            }
            // Create the role and save it in the database
            const role = await Roles.create(req);
            return role;
          } catch (error) {
            throw ({ message: "Error Creating Role!" })
            
          }
    },

    // Retrieve All Roles
    findAllRoles: async () =>
      {
         try {
        const roles = await Roles.findAll();
        return roles;
      } 
      catch (error) {
        throw({ message: "Error Fetching All Roles!"})
        
      }
    },

// Assign a permission to a role
editRole: async (req) => {
      // Validate request
      if (!req.roleId || !req.permissionId) {
          throw ({ message: 'Please provide roleId and permissionId!' });
      }
      // Check if the link already exists
      const existingLink = await RolesPermissions.findOne({
          where: {
              roleId: req.roleId,
              permissionId: req.permissionId,
          },
      });

      if (existingLink) {
          throw ({ message: 'Role and Permission Already Exists!' });
      }

      // Before assigning, let's ensure that the provided IDs actually exist in their respective tables.
      const [role, permission] = await Promise.all([
          Roles.findByPk(req.roleId),
          Permissions.findByPk(req.permissionId),
      ]);

      if (!role) {
          throw ({ message: 'Role Not Found!' });
      }

      if (!permission) {
          throw ({ message: 'Permission Not Found!' });
      }

      // All entities exist, let's link them
      const linkData = {
          roleId: role.id,
          permissionId: permission.id,
      };

      const rolesPermissions = await RolesPermissions.create(linkData);
      return rolesPermissions;
  
},
}

module.exports = rolesService