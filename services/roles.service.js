const db = require("../models");
const Roles = db.roles;
const Permissions = db.permissions;
const RolesPermissions = db.rolesPermissions;
const Modules = db.modules;

const rolesService = {
  // Create A New Role
  createRole: async (req) => {
    try {
      // Create the role and save it in the database
      const role = await Roles.create(req);
      return role;
    } catch (error) {
      throw ({ message: error.message || "Error Creating Role!" })

    }
  },

  // Retrieve All Roles
  findAllRoles: async (currentPage, pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;

      const { count, rows } = await Roles.findAndCountAll({
        offset,
        limit,
        order: [
          ['id','DESC']
        ]
      });

      const totalPages = Math.ceil(count / pageSize);

      return { count, totalPages, roles: rows };
    } catch (error) {
      throw ({message: error.message || "Error Fetching All Roles"});
    }
  },

  // Retreive Single Role
  findSingleRole: async (roleId) => {
    try {
      const role = await Roles.findOne({ where: { id: roleId } });
      if (!role) {
        throw ({ message: "Role Not Found!" })
      }
      const userPermissions = await RolesPermissions.findAll({
        where: { roleId: roleId },
        include: [
          {
            model: Permissions,
            as: 'PermissionsRoles',
            attributes: ['id', 'name'],
            include: [
              {
                model: Modules,
                as: 'modules',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      });

      // Now, aggregate the permissions by module
      const aggregatedPermissions = {};
      userPermissions.forEach(rolesPermission => {
        const permissionsRolesArray = rolesPermission.PermissionsRoles;
        const moduleId = permissionsRolesArray.dataValues.modules.id;
        const moduleName = permissionsRolesArray.dataValues.modules.name;
        const permissionName = permissionsRolesArray.dataValues.name;
        const permissionId = permissionsRolesArray.dataValues.id;

        if (!aggregatedPermissions[moduleId]) {
          aggregatedPermissions[moduleId] = {
            moduleName: moduleName,
            permissions: [],
          };
        }

        aggregatedPermissions[moduleId].permissions.push({
          id: permissionId,
          name: permissionName,
        });
      });

      // Transform the aggregatedPermissions object into the desired array format
      const permissionsData = Object.keys(aggregatedPermissions).map(moduleId => ({
        id: parseInt(moduleId),
        label: aggregatedPermissions[moduleId].moduleName,
        hasAccess: aggregatedPermissions[moduleId].permissions,
      }));

      const roleData = {
        role,
        permissions: permissionsData,
      };

      return roleData;
    } catch (error) {
      throw { message: error.message || "Error Fetching Single Role!" };
    }
  },


  // Update permissions for a role
  updatePermissions: async (roleId, permissionsToUpdate) => {
    try {
      // Fetch current permissions for the role using the association
      const currentPermissions = await RolesPermissions.findAll({
        where: { roleId: roleId },
        include: [{
          model: Permissions,
          as: 'PermissionsRoles',
          attributes: ['id'],
        }]
      });

      const currentPermissionIds = new Set(currentPermissions.map(cp => cp.PermissionsRoles.id));

      // Validate provided permission IDs
      const validPermissions = await Permissions.findAll({
        where: { id: permissionsToUpdate },
        attributes: ['id']
      });
      const validPermissionIds = new Set(validPermissions.map(p => p.id));

      // Update permissions
      for (const permissionId of permissionsToUpdate) {
        if (validPermissionIds.has(permissionId)) {
          if (!currentPermissionIds.has(permissionId)) {
            // Add missing permission
            await RolesPermissions.create({ roleId, permissionId });
          }
        } else {
          // Handling invalid permission ID case 
          throw { message: 'One or more permissions not found!' };

        }
      }

      // Remove extra permissions not included in permissionsToUpdate
      for (const currentPermissionId of currentPermissionIds) {
        if (!permissionsToUpdate.includes(currentPermissionId)) {
          await RolesPermissions.destroy({
            where: { roleId: roleId, permissionId: currentPermissionId }
          });
        }
      }

      return { status: 'Permissions updated successfully' };
    } catch (error) {
      throw ({message: error.message || "Error Updating Permissions For A Role"});
    }
  },

  // Update Role
  updateRole: async (req, roleId) => {
    try {
      const updatedRoleData = {
        name: req.name,
        description: req.description,
        roleStatus: req.roleStatus
      }
      
      await Roles.update(updatedRoleData, { where: { id: roleId } });
      // Fetch the updated role after the update
      const updatedRole = await Roles.findOne({ where: { id: roleId } }, { raw: true });
      return updatedRole;
    } catch (error) {
      throw { message: error.message || "Error Updating Role" };
    }
  },

  // Inactive the role
  deleteRole: async (roleId) => {
    try {
      const updatedData = {
        roleStatus: "inactive"
      }
      await Roles.update(updatedData, { where: { id: roleId } });
      // Fetch the updated role after the update
      const updatedRole = await Roles.findByPk(roleId, { raw: true });
      return updatedRole;

    } catch (error) {
      throw { message: error.message || "Error Suspending Department" };
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