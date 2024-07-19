const db = require("../models");
const Departments = db.departments;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const departmentsService = {
    // Create A New Department
    createDepartment : async(req) => {
        try {
            // Validate the department data
            if (!req.name) {
              throw({ message: 'Please Provide Name!'})
            }
            // Create the department and save it in the database
            const department = await Departments.create(req);

            return department;
          } catch (error) {
            throw { message: error.message || "Error Creating Department" };
            
          }
    },

    // Retrieve All Deparments
    findAllDepartments: async (req) => {
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
    
            const departments = await Departments.findAll(queryOptions);
            return departments;
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Departments");
        }
    },

    // Retrieve Single Department
    findSingleDepartment: async (req) =>
    {
        try{
            const departmentId = req.params.id
            const department = await Departments.findOne({ where: { id: departmentId } });
            if (!department)
            {
                throw ({message: "Department Not Found!"})
            }
            return department;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single Department" };
        }
    },

    // Updates Department
    updateDepartment: async (req) =>
    {
        try {
            const departmentId = req.params.id;
            const department = await Departments.findByPk(departmentId);
            if (!department)
            {
                throw ({message: "Department Not Found!"});
            }
            
            await Departments.update(req.body, { where: { id: departmentId } });

            // Fetch the updated department after the update
            const updatedDepartment = await Departments.findOne({ where: { id: departmentId } } , {raw:true});
    
            return updatedDepartment;

        }   catch(error) {
            throw { message: error.message || "Error Updating Department" };
        }
    },

    // Deletes/Suspend Department
    suspendDepartment: async (req) =>
    {
        try {
            const departmentId = req.params.id;
            const department = await Departments.findByPk(departmentId);
            if (!department)
            {
                throw ({message: "Department Not Found!"});
            } 
            const updatedData = {
                departmentStatus: "inactive"
            }
            
            await Departments.update(updatedData, { where: { id: departmentId } });

            // Fetch the updated department after the update
            const updatedDepartment = await Departments.findByPk(departmentId,{raw: true });
    
            return updatedDepartment;

            
        }   catch (error)
        {
            throw { message: error.message || "Error Suspending Department" };
        }
    }
}

module.exports = departmentsService