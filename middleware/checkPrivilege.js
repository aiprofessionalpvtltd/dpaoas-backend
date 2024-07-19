const jwt = require('jsonwebtoken');
const db = require('../models');
const Users = db.users;
const Roles = db.roles;
const UserSession = db.userSession;
const RolesPermissions = db.rolesPermissions
const Permissions = db.permissions
const RolesUsers = db.userRoles;
const logger = require('../common/winston');
require('dotenv').config();


const checkUserPrivileges = action => {
  return async (req, res, next) => {
    // Assuming you have user information in the request object
    const user = req.user;

    // Extract the action from the route
    const [, routeAction] = req.route.path.split('/');
    console.log(routeAction);

    // Check if the user has the required privileges for the action
    //Step 1: Fetch roles associated with the user
    const userRoles = await Roles.findAll({
      where: { id: user.fkRoleId }
    });
    console.log(userRoles)
    //console.log("User Roles", userRoles)
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
    console.log(userPermissions)


    const hasPermission = userPermissions.includes(routeAction);
    if (!hasPermission) {
      return res.status(400).send('Access Denied: You do not have the required permission');
    }
    else {
      next();
    }

  };
};
module.exports = checkUserPrivileges;
