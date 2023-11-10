const modulesService = require('../services/modules.service')

const modulesController = {
  // Create a Module
createModule: async (req, res) => {

  try{
    const module = await modulesService.createModule(req.body);
    res.status(201).send(module);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
  
},

// Retrieve All Modules
findAllModules: async (req, res) => {
  try {
    const modules = await modulesService.findAllModules();
    res.send(modules);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
},
}

module.exports = modulesController;
