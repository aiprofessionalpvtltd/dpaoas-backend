const db = require("../models");
const Permissions = db.permissions;
const Modules = db.modules;
const ModulesPermissions = db.modulesPermissions

const permissionsService = {

    // Create A Permission
    createPermission: async(permissionData) =>
    {
        try {
            // Validate request
            if (!permissionData.name) {
              throw new Error("Please provide name");
            }
            // Create and Save Module in the database
            const createdPermission = await Permissions.create(permissionData);
            return createdPermission;
         } 
        catch (error) {
            throw new Error(error.message || "Some error occurred while creating the Permission.");
        }
    },

    // Retrieve All Permissions
    findAllPermissions: async()=>
    {
        try {
            const permissions = await Permissions.findAll();
            return permissions;
          } 
          catch (error) {
            throw new Error("Error occurred while retrieving permissions.");
          }
    },

    // Assign Permission to Module
    editPermission: async({module_id, permission_id}) =>
    {
        try {
            // Validate request
            if (!module_id || !permission_id) {
              throw new Error("Please provide module_id, and permission_id");
            }
        
            // Before assigning, let's ensure that the provided IDs actually exist in their respective tables.
            const [module, permission] = await Promise.all([
              Modules.findByPk(module_id),
              Permissions.findByPk(permission_id)
            ]);
        
            if (!module) {
              throw new Error("Module not found!");
            }
        
            if (!permission) {
              throw new Error("Permission not found!");
            }
        
            // All entities exist, let's link them
            const linkData = {
              module_id: module.id,
              permission_id: permission.id,
            };
        
            await ModulesPermissions.create(linkData);
        
            return { message: "Permission assigned successfully!" };
          } catch (error) {
            throw new Error(error.message || "Some error occurred while linking the entities.");
          }
    }
}

module.exports = permissionsService;