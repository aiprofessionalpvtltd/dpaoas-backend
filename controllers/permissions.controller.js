const db = require("../models");
const Permissions = db.permissions;
const Modules = db.modules;
const ModulesPermissions = db.modulesPermissions
const Op = db.Sequelize.Op;
const permissionsService = require('../services/permissions.service')

const permissionsController = {
// Create and Save a new Permission
createPermission: async (req, res) => {  
  try{
    const permission = await permissionsService.createPermission(req.body);
    res.status(200).send(permission);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
},

findAllPermissions: async(req, res) => {
  try {
    const permissions = await permissionsService.findAllPermissions();
    res.send(permissions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
},

// Assign Permission to Module
editPermission: async (req, res) => {
  try {
    const result = await permissionsService.editPermission(req.body);
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
},
}


module.exports = permissionsController;