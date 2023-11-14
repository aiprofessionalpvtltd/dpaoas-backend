const db = require("../models");
const Permissions = db.permissions;
const Modules = db.modules;
const ModulesPermissions = db.modulesPermissions

const permissionsService = {

    // Create A Permission
    createPermission: async(req) =>
    {
        try {
            // Validate request
            if (!req.name) {
              throw new Error("Please provide name!");
            }
            // Create and Save Module in the database
            const createdPermission = await Permissions.create(req);
            return createdPermission;
         } 
        catch (error) {
            throw new Error("Error Creating Permission!");
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
            throw new Error("Error Fetching All Permissions");
          }
    },

    // Assign Permission to Module
    editPermission: async(req) =>
    {
       
            // Validate request
            if (!req.moduleId || !req.permissionId) {
              throw ({ message: 'Please provide moduleId and permissionId!'})
            }     
            
              // Check if the link already exists
              const existingLink = await ModulesPermissions.findOne({
                  where: {
                      moduleId: req.moduleId,
                      permissionId: req.permissionId,
                  },
              });

              if (existingLink) {
                  throw ({ message: 'Module and Permission Already Exists!' });
              }
            // Before assigning, let's ensure that the provided IDs actually exist in their respective tables.
            const [module, permission] = await Promise.all([
              Modules.findByPk(req.moduleId),
              Permissions.findByPk(req.permissionId)
            ]);
        
            if (!module) {
              throw ({ message: 'Module Not Found!'})
            }
            if (!permission) {
              throw ({ message : "Permission Not Found!"})
            }
            // All entities exist, let's link them
            const linkData = {
              moduleId: module.id,
              permissionId: permission.id,
            };
        
            const modulesPermissions = await ModulesPermissions.create(linkData);
            return modulesPermissions;
    }
}

module.exports = permissionsService;