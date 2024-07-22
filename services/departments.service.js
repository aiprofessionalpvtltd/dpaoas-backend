const db = require("../models");
const Departments = db.departments;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const departmentsService = {
    // Create A New Department
    createDepartment: async (req) => {
        try {
            // Create the department and save it in the database
            const department = await Departments.create(req);
            return department;
        } catch (error) {
            throw { message: error.message || "Error Creating Department" };

        }
    },

    // Retrieve All Deparments
    findAllDepartments: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Departments.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, departments: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Departments");
        }
    },

    // Search Departments: 
    searchDepartments: async (searchQuery, queryOptions) => {
        try {
            if (searchQuery) {
                whereCondition = {
                    departmentName: { [Op.like]: `%${searchQuery}%` }
                };
            }
            queryOptions.where = whereCondition;
            const departments = await Departments.findAll(queryOptions);
            return departments;
        } catch (error) {
            throw { message: error.message || "Error Searching Department" };
        }
    },

    // Retrieve Single Department
    findSingleDepartment: async (departmentId) => {
        try {
            const department = await Departments.findOne({ where: { id: departmentId } });
            if (!department) {
                throw ({ message: "Department Not Found!" })
            }
            return department;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single Department" };
        }
    },

    // Updates Department
    updateDepartment: async (req, departmentId) => {
        try {

            await Departments.update(req.body, { where: { id: departmentId } });
            // Fetch the updated department after the update
            const updatedDepartment = await Departments.findOne({ where: { id: departmentId } }, { raw: true });
            return updatedDepartment;
        } catch (error) {
            throw { message: error.message || "Error Updating Department" };
        }
    },

    // Deletes/Suspend Department
    deleteDepartment: async (req) => {
        try {
            const updatedData = {
                departmentStatus: "inactive"
            }
            await Departments.update(updatedData, { where: { id: req } });
            // Fetch the updated department after the update
            const updatedDepartment = await Departments.findByPk(req, { raw: true });
            return updatedDepartment;
        } catch (error) {
            throw { message: error.message || "Error Suspending Department" };
        }
    },
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