const db = require("../models");
const Permissions = db.permissions;
const Modules = db.modules;
const ModulesPermissions = db.modulesPermissions
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

  // Create a Permission
  let inputData = req.body

  // Save Permission in the database
  Permissions.create(inputData)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};


exports.findAll = (req, res) => {
  Permissions.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

exports.editPermission = (req, res) => {
  // Validate request
  if (!req.body.module_id || !req.body.permission_id) {
      res.status(400).send({
          message: "Please provide module_id, and permission_id"
      });
      return;
  }

  // Before assigning, let's ensure that the provided IDs actually exist in their respective tables.
  Promise.all([
      Modules.findByPk(req.body.module_id),
      Permissions.findByPk(req.body.permission_id)
  ])
  .then(([module, permission]) => {
    
      if (!module) {
          res.status(400).send({
              message: "Module not found!"
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
         
          module_id: module.id,
          permission_id: permission.id,
      };

      ModulesPermissions.create(linkData)
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