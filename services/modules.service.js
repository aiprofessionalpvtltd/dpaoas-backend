const db = require("../models");
const Modules = db.modules;

const modulesService = {

    // Create A Module
    createModule: async (moduleData) =>
    {
        try {
            // Validate request
            if (!moduleData.name) {
              throw new Error("Please provide name");
            }
            // Create and Save Module in the database
            const createdModule = await Modules.create(moduleData);
            return createdModule;
         } 
        catch (error) {
            throw new Error(error.message || "Some error occurred while creating the Module.");
        }
      
    },

    // Retrieve All Modules
    findAllModules: async () =>
    {
        try {
            const modules = await Modules.findAll();
            return modules;
          } 
          catch (error) {
            throw new Error("Error occurred while retrieving modules.");
          }
    }
}


module.exports = modulesService;