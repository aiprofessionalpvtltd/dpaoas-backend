
const roleService = require('../services/roles.service');
const rolesController = {
// Create and Save a new Role
createRole: async (req, res) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).send(role);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
},

// Retrieve All Roles
findAllRoles: async (req, res) => {
  try {
    const roles = await roleService.findAllRoles();
    res.send(roles);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
},

// Assign a permission to a role
editRole: async (req, res) => {
  try {
    const result = await roleService.editRole(req.body);
    res.send(result);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
},
}

module.exports = rolesController;