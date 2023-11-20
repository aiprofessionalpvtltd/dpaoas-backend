const db = require("../models");
const Designations = db.designations;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const designationsService = {
    // Create A New Designation
    createDesignation : async(req) => {
        try {
            // Validate the department data
            if (!req.name) {
              throw({ message: 'Please Provide Name!'})
            }
            // Create the department and save it in the database
            const designation = await Designations.create(req);
            
            return designation;
          } catch (error) {
            throw { message: error.message || "Error Creating Designation!" };
            
          }
    },

    // Retrieve All Designations
    findAllDesignations: async (req) => {
        try {
            const searchQuery = req.query.search; // Get search query from request parameters
            const queryOptions = {};
    
            if (searchQuery) {
                // Add search condition to query options
                queryOptions.where = {
                    name: {
                        [Op.like]: `%${searchQuery}%` // Assuming Sequelize and using the LIKE operator for a partial match
                    }
                };
            }
    
            const designations = await Designations.findAll(queryOptions);
            return designations;
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Designations");
        }
    },

     // Retrieve Single Designation
     findSingleDesignation: async (req) =>
     {
         try{
             const designationId = req.params.id
             const designation = await Designations.findOne({ where: { id: designationId } });
             if (!designation)
             {
                 throw ({message: "Designation Not Found!"})
             }
             return designation;
         }
         catch (error) {
            throw { message: error.message || "Error Fetching Single Designation!" };
         }
     },

      // Updates Designation
    updateDesignation: async (req) =>
    {
        try {
            const designationId = req.params.id;
            const designation = await Designations.findByPk(designationId);
            if (!designation)
            {
                throw ({message: "Designation Not Found!"});
            }
            
            await Designations.update(req.body, { where: { id: designationId } });

            // Fetch the updated department after the update
            const updatedDesignation = await Designations.findOne({ where: { id: designationId } });
    
            return updatedDesignation;

        }   catch(error) {
            throw { message: error.message || "Error Updating Designation!" };
        }
    },

    // Deletes/Suspend Designation
    suspendDesignation: async (req) =>
    {
        try {
            const designationId = req.params.id;
            const designation = await Designations.findByPk(designationId);
            if (!designation)
            {
                throw ({message: "Designation Not Found!"});
            }
            
            const updatedData = 
            {
                designationStatus: "inactive"
            }
            
            await Designations.update(updatedData, { where: { id: designationId } });

            // Fetch the updated department after the update
            const updateDesignation = await Designations.findOne({ where: { id: designationId } });
    
            return updateDesignation;

            
        }   catch (error)
        {
            throw { message: error.message || "Error Suspending Designation!" };
        }
    }
}

module.exports = designationsService