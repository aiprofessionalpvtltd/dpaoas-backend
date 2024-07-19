const jwt = require('jsonwebtoken');
const db = require('../models');
const Users = db.users;
const UserSession = db.userSession;
const RolesPermissions = db.rolesPermissions
const Permissions = db.permissions
const Modules = db.modules
const logger = require('../common/winston');
require('dotenv').config();

// Getting Action like 'View' from Method like 'GET'
function getActionFromMethod(method) {
  // Map HTTP methods to actions
  switch (method) {
    case 'GET': return 'View';
    case 'POST': return 'Add';
    case 'PUT': return 'Edit';
    case 'DELETE': return 'Delete';
    default: return null;
  }
}

// Extract Module Name from Base Url
function getModuleFromBaseUrl(baseUrl) {
  // Remove the "/api/" prefix from the baseUrl
  const pathWithoutApi = baseUrl.replace(/^\/api\//, '');
  // Extract the module name (first part of the path)
  const module = pathWithoutApi.split('/')[0];
  // Capitalize the first letter of the module name because Module Name is capital for now
  return module.charAt(0).toUpperCase() + module.slice(1);
}

// Get Permissions Using Module and Action
async function checkUserPermission(permissions, module, action) {
  try {
    // Find the module in the database based on its name
    const targetModule = await Modules.findOne({ where: { name: module } });
    if (!targetModule) {
      // Module not found, the user doesn't have permission
      return false;
    }
    // Check if the user's permissions include the required action for the specified module
    const hasPermission = permissions.some(permission => {
      return permission.fkModuleId === targetModule.id && permission.name === action;
    });
    return hasPermission;
  } catch (error) {
    console.error("Error checking user permission:", error);
    // Handle errors
    return false;
  }
}


// Auth Middleware for Token Verification
const tokenVerification = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    // If No token And No User Session
    if (!authorization) {

      logger.error('Please Provide Token!');
      return res.status(400).send({
        success: false,
        error: "Please Provide Token!"
      })
    }

    else {
      const token = authorization.replace('Bearer ', '');

      // Verify the token and extract user information
      jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            logger.error('Token has expired!');
            return res.status(401).send({
              success: false,
              error: "Token has expired!"
            });
          } else {
            logger.error('Error In Token JWT Verification!');
            return res.status(400).send({
              success: false,
              error: "Error In Token JWT Verification!"
            });
          }
        }
        // Check if the token exists in the UserSession table and is not expired
        const session = await UserSession.findOne({ where: { tokens: token } });
        if (!session) {
          logger.error('User Session Not Found!');
          return res.status(400).send({
            success: false,
            error: "User Session Not Found!"
          })
        }
        // Attach user information from the payload to the request object
        const user = await Users.findOne({ where: { id: payload.userId } });
        const rolesPermissions = await RolesPermissions.findAll({ where: { roleId: user.fkRoleId } })
        const permissionIds = rolesPermissions.map(rp => rp.permissionId);

        // Query the Permissions table with the collected permission IDs
        const permissions = await Permissions.findAll({
          where: {
            id: permissionIds
          },
          attributes: ['name', 'fkModuleId']
        });

        // Determine the module from req.baseUrl
        const module = getModuleFromBaseUrl(req.baseUrl);
      
        // Map HTTP method to action
        const action = getActionFromMethod(req.method);

        // Check if user has required permission for the module and action
        const hasPermission = await checkUserPermission(permissions, module, action);
        if (!hasPermission) {
          logger.error('User does not have required permission for this URL');
          return res.status(400).send({
            success: false,
            message: "User does not have required permission for this URL"
          });
        }
        req.user = user;
        next();
      });
    }

  } catch (error) {
    logger.error('Error during token verification!');
    return res.status(400).send({
      success: false,
      error: "Error during token verification!"
    })
  }
}
module.exports = tokenVerification;