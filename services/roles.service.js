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
    createRole : async(roleData) => {
        try {
            // Validate the role data
            if (!roleData.name) {
              throw new Error('Content can not be empty.');
            }
        
            // Create the role and save it in the database
            const role = await Roles.create(roleData);
            return role;
          } catch (error) {
            throw new Error(error.message || 'Error occurred while creating the Role.');
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
        throw new Error("Error occurred while retrieving roles.");
      }
    },

    // Assign a permission to a role
    editRole: async ({role_id, permission_id}) => {
        try {
          // Validate request
          if (!role_id || !permission_id) {
            throw new Error("Please provide role_id, and permission_id");
          }
      
          // Before assigning, let's ensure that the provided IDs actually exist in their respective tables.
          const [role, permission] = await Promise.all([
            Roles.findByPk(role_id),
            Permissions.findByPk(permission_id)
          ]);
      
          if (!role) {
            throw new Error("Role not found!");
          }
      
          if (!permission) {
            throw new Error("Permission not found!");
          }
      
          // All entities exist, let's link them
          const linkData = {
            role_id: role.id,
            permission_id: permission.id,
          };
      
          await RolesPermissions.create(linkData);
      
          return { message: "Permission assigned successfully!" };
        } catch (error) {
          throw new Error(error.message || "Some error occurred while linking the entities.");
        }
      }
}

module.exports = rolesService