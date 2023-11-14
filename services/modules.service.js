const db = require("../models");
const Modules = db.modules;

const modulesService = {

    // Create A Module
    createModule: async (req) =>
    {
        try {
            // Validate request
            if (!req.name) {
              throw ({message: "Please provide name!"})
            }
            // Create and Save Module in the database
            const createdModule = await Modules.create(req);
            return createdModule;
         } 
        catch (error) {
          throw ({ message: "Error Creating Module!"})
           
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
            throw ({message: "Error Fetching All Modules!"})
            
          }
    }
}


module.exports = modulesService;