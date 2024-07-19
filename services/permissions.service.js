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


}

module.exports = permissionsService;