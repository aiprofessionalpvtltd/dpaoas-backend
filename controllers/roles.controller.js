const db = require("../models");
const Roles = db.roles;
const Permissions = db.permissions;
const Modules = db.modules;
const RolesPermissions = db.rolesPermissions;
//const ModulesRolesPermissions = db.modules_roles_permissions;
const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Role
  let inputData = req.body
  // Save Role in the database
  Roles.create(inputData)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Role."
      });
    });
};


exports.findAll = (req, res) => {
  Roles.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Roles."
      });
    });
};


exports.editRole = (req, res) => {
  // Validate request
  if (!req.body.role_id || !req.body.permission_id) {
      res.status(400).send({
          message: "Please provide role_id, and permission_id"
      });
      return;
  }

  // Before assigning, let's ensure that the provided IDs actually exist in their respective tables.
  Promise.all([
      Roles.findByPk(req.body.role_id),
      Permissions.findByPk(req.body.permission_id)
  ])
  .then(([role, permission]) => {
    
      if (!role) {
          res.status(400).send({
              message: "Role not found!"
          });
          return;
      }

      if (!permission) {
          res.status(400).send({
              message: "Permission not found!"
          });
          return;
      }

      // All entities exist, let's link them
      let linkData = {
         
          role_id: role.id,
          permission_id: permission.id,
      };

      RolesPermissions.create(linkData)
          .then(() => {
              res.send({ message: "Permission assigned successfully!" });
          })
          .catch(err => {
              res.status(500).send({
                  message: err.message || "Some error occurred while linking the entities."
              });
          });
  })
  .catch(err => {
      res.status(500).send({
          message: err.message || "Some error occurred while checking the entities."
      });
  });
};
