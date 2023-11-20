const jwt = require('jsonwebtoken');
const db = require('../models');
const Users = db.users;
const UserSession = db.userSession;
const RolesPermissions = db.rolesPermissions
const Permissions = db.permissions
const RolesUsers = db.userRoles;
const logger = require('../common/winston');
require('dotenv').config();

// Auth Middleware for Checking Privileges
 const checkPrivileges = requiredPermission => {
    return async (req, res, next) => {
      try {
        const userId = req.userId; // From tokenVerification middleware
  
        // Step 1: Fetch roles associated with the user
        const userRoles = await RolesUsers.findAll({
          where: { userId: userId }
        });

        console.log("User Roles", userRoles)
        const roleIds = userRoles.map(userRole => userRole.roleId);
  
        // Step 2: Fetch permission IDs associated with these roles
        const rolesPermissions = await RolesPermissions.findAll({
          where: { roleId: roleIds }
        });
        const permissionIds = rolesPermissions.map(rolePermission => rolePermission.permissionId);
  
        // Step 3: Fetch actual permissions from permission IDs
        const permissions = await Permissions.findAll({
          where: { id: permissionIds }
        });
        const userPermissions = permissions.map(permission => permission.name);
  
        // Check if user has the required permission
        const hasPermission = userPermissions.includes(requiredPermission);
        if (!hasPermission) {
          return res.status(400).send('Access Denied: You do not have the required permission');
        }
  
        next();
      } catch (error) {
        res.status(500).send('Error in permission verification');
      }
    }

};

module.exports = checkPrivileges;
