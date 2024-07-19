const jwt = require('jsonwebtoken');
const db = require('../models');
const Users = db.users;
const UserSession = db.userSession;
const RolesPermissions = db.rolesPermissions
const Permissions = db.permissions
const RolesUsers = db.userRoles;
const logger = require('../common/winston');
require('dotenv').config();

// Auth Middleware for Token Verification
  const  tokenVerification = async (req, res, next) => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        logger.error('Please Provide Token!');
        return res.status(400).send({
          success: false,
          error: "Please Provide Token!"
          })
      }

      const token = authorization.replace('Bearer ', '');

      // Verify the token and extract user information
      jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {
          logger.error('Error In Token JWT Verification!');
          return res.status(400).send({
            success: false,
            error: "Error In Token JWT Verification!"
            })
        }

        // Check if the token exists in the UserSession table and is not expired
        const session = await UserSession.findOne({ where: { tokens: token } });
        if (!session) {
          logger.error('Invalid or Expired Token!');
          return res.status(400).send({
            success: false,
            error: "Invalid or Expired Token!"
            })
        }
        // Attach user information from the payload to the request object
        req.userId = payload._id; // Assuming the userId is stored in the token payload
        next();
      });
    } catch (error) {
      logger.error('Error during token verification!');
      return res.status(400).send({
        success: false,
        error: "Error during token verification!"
        })
    }
  }

module.exports = tokenVerification;
