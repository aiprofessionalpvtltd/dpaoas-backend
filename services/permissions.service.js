const db = require("../models");
const Permissions = db.permissions;
const Modules = db.modules;

const permissionsService = {

  // Create A Permission
  createPermission: async (req) => {
    try {
      console.log("here")
      // Create and Save Permission in the database
      const createdPermission = await Permissions.create(req);
      return createdPermission;
    }
    catch (error) {
      throw ({ message: error.message || "Error Creating Permission!" });
    }
  },

  // Retrieve All Permissions
  findAllPermissions: async () => {
    try {
      const permissions = await Permissions.findAll({
        include: [
          {
            model: Modules,
            as: 'modules',
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id', 'name', 'fkModuleId']
      });
      return permissions;
    }
    catch (error) {
      throw ({ message: error.message || "Error Fetching All Permissions" });
    }
  },

  // Retrieve All Modules Permissions
  findAllModulesPermissions: async () => {
    try {
      // Fetch permissions with associated module data
      const permissions = await Permissions.findAll({
        include: [
          {
            model: Modules,
            as: 'modules',
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id', 'name', 'fkModuleId']
      });

      // Aggregate the permissions by module name, also keeping track of the moduleId
      const aggregatedPermissions = permissions.reduce((acc, permission) => {
        const moduleName = permission.modules.name;
        const moduleId = permission.modules.id;

        if (!acc[moduleName]) {
          acc[moduleName] = { moduleId, actions: [] };
        }

        const action = {
          id: permission.id,
          name: permission.name
        };

        acc[moduleName].actions.push(action);
        return acc;
      }, {});

      // Convert to desired format
      const modulesPermissions = Object.keys(aggregatedPermissions).map((moduleName) => {
        const { moduleId, actions } = aggregatedPermissions[moduleName];
        return {
          id: moduleId,
          label: moduleName,
          hasAccess: actions
        };
      });

      return { modulesPermissions };

    } catch (error) {
      throw ({ message: error.message || "Error Fetching All Modules Permissions" });
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