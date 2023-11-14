const modulesService = require('../services/modules.service')
const logger = require('../common/winston')
const modulesController = {
  // Create a Module
createModule: async (req, res) => {

  try{
    const module = await modulesService.createModule(req.body);
    logger.info('Module Created Successfully!');
    return res.status(200).send({
      success: true,
      message: "Module Created Successfully!",
      data: module,
      })
  } catch (error) {
    logger.error(error.message);
    return res.status(400).send({
      success: false,
      message: error.message
     
      })
  }
  
},

// Retrieve All Modules
findAllModules: async (req, res) => {
  try {
    const modules = await modulesService.findAllModules();
    logger.info('All Modules Fetched Successfully!');
    return res.status(200).send({
      success: true,
      message: "All Modules Fetched Successfully!",
      data: modules,
      })
  } catch (error) {
    logger.error(error.message);
    return res.status(400).send({
      success: false,
      message: error.message
     
      })
  }
},
}

module.exports = modulesController;
