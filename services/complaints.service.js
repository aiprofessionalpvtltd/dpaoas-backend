const db = require("../models");
const Users = db.users;
const Employees = db.employees
const Complaints = db.complaints;
const ComplaintTypes = db.complaintTypes;
const ComplaintCategories = db.complaintCategories
const ResolverAssignments = db.resolverAssignments
const Departments = db.departments
const Designations = db.designations
const Inventory = db.inventories
const UserInventory = db.userInventory
const InventoryBills = db.inventoryBills
const Op = db.Sequelize.Op;

const logger = require('../common/winston');

const complaintsService = {
    // Issue A New Complaint
    issueComplaint: async (req) => {
        try {
            // Issue complaint and save it in the database
            const complaint = await Complaints.create(req);
            return complaint;
        } catch (error) {
            throw { message: error.message || "Error Issuing Complaint" };

        }
    },

    // Resolve Complaint
    resolveComplaint: async (complaintId, updateData) => {
        try {
            const resolvedComplaint = await Complaints.update(updateData, { where: { id: complaintId } });
            return resolvedComplaint;
        } catch (error) {
            throw { message: error.message || `Error Resolving Complaint:${complaintId}` };
        }
    },

    // Retrieve All Complaints For Admin Side
    findAllComplaints: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Complaints.findAndCountAll({
                include: [
                    {
                        model: Users,
                        as: 'complaineeUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: Users,
                        as: 'resolverUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: ComplaintTypes,
                        as: 'complaintType',
                        attributes: ['id', 'complaintTypeName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['id', 'complaintCategoryName']
                    }
                ],

                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, complaints: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Complaints");
        }

    },

    // Retrieve All Complaints For Toner Installation
    findAllComplaintsForToner: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Complaints.findAndCountAll({
                include: [
                    {
                        model: Users,
                        as: 'complaineeUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: Users,
                        as: 'resolverUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: ComplaintTypes,
                        as: 'complaintType',
                        attributes: ['id', 'complaintTypeName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['id', 'complaintCategoryName'],
                        where: {
                            complaintCategoryName: 'Toner Installation'
                        },
                    },
                ],

                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
           //console.log(rows)
           const complaineeUserIds = rows.map(complaint => complaint.fkComplaineeUserId);

            const inventory = await UserInventory.findAll({
                where: {fkAssignedToUserId: complaineeUserIds},
                include: [
                    {
                        model: Inventory,
                        as: "assignedInventory",
                        include: [{
                            model: InventoryBills,
                            as: "invoiceNumber"
                        }]
                    }
                ]
            })
            console.log(inventory)
            const result = {
                rows,
                inventory
            }
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, complaints: result };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Complaints");
        }

    },

    // Retrieve All Complaints By Complainee
    findAllComplaintsByComplainee: async (complaineeId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Complaints.findAndCountAll({
                where: { fkComplaineeUserId: complaineeId },
                include: [
                    {
                        model: Users,
                        as: 'complaineeUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: Users,
                        as: 'resolverUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: ComplaintTypes,
                        as: 'complaintType',
                        attributes: ['complaintTypeName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['complaintCategoryName']
                    }
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],

            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, complaints: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Complaints");
        }

    },

    // Retrieve All Complaints By Resolver
    findAllComplaintsByResolver: async (resolverId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Complaints.findAndCountAll({
                where: { fkAssignedResolverId: resolverId },
                include: [
                    {
                        model: Users,
                        as: 'complaineeUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: Users,
                        as: 'resolverUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: ComplaintTypes,
                        as: 'complaintType',
                        attributes: ['complaintTypeName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['complaintCategoryName']
                    }
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, complaints: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Complaints");
        }

    },

    // Search Complaint
    searchComplaint: async (searchCriteria) => {
        try {
            let queryOptions = {
                include: [
                    {
                        model: Users,
                        as: 'complaineeUser',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                    },
                    {
                        model: Users,
                        as: 'resolverUser',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                    },
                    {
                        model: ComplaintTypes,
                        as: 'complaintType',
                        attributes: ['complaintTypeName'],
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['complaintCategoryName']
                    },

                ],
                subQuery: false,
                distinct: true,
                where: {}
            };

            // Build the query options based on search criteria
            for (const key in searchCriteria) {
                // Adjust the query based on your model and search requirements
                // Example:
                if (key === 'complaintType') {
                    queryOptions.where['$complaintType.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'complaintCategory') {
                    queryOptions.where['$complaintCategory.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'complaineeUser') {
                    queryOptions.where['$complaineeUser.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'resolverUser') {
                    queryOptions.where['$resolverUser.id$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'keyword') {
                    queryOptions.where[Op.or] = [
                        { complaintDescription: { [Op.iLike]: `%${searchCriteria.keyword}%` } },
                        { complaintRemark: { [Op.iLike]: `%${searchCriteria.keyword}%` } },
                    ];
                }

                if (key === 'complaintIssuedDate') {
                    queryOptions.where['$complaintIssuedDate$'] = { [Op.eq]: searchCriteria[key] };
                }
                if (key === 'complaintResolvedDate') {
                    queryOptions.where['$complaintResolvedDate$'] = { [Op.eq]: searchCriteria[key] };
                }
            }

            const complaints = await Complaints.findAll(queryOptions);
            return complaints;
        } catch (error) {
            throw new Error(error.message || "Error Searching Complaint");
        }
    },

    // Retrieve Single Complaint
    findSingleComplaint: async (complaintId) => {
        try {
            const complaint = await Complaints.findOne({
                where: { id: complaintId },
                include: [
                    {
                        model: Users,
                        as: 'complaineeUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id',]
                    },
                    {
                        model: Users,
                        as: 'resolverUser',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id',]
                    },
                    {
                        model: ComplaintTypes,
                        as: 'complaintType',
                        attributes: ['id', 'complaintTypeName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['id', 'complaintCategoryName']
                    }
                ],
            });
            if (!complaint) {
                throw ({ message: "Complaint Not Found!" })
            }
            return complaint;
        }
        catch (error) {
            throw { message: error.message || `Error Fetching Single Complaint:${complaintId}` };
        }
    },


    // Retrieve All Complaint Types
    findAllComplaintTypes: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await ComplaintTypes.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, complaintTypes: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Complaint Types");
        }

    },

    // Retrieve All Complaint Categories
    findAllComplaintCategories: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await ComplaintCategories.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, complaintCategories: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Complaint Categories");
        }

    },

    // Delete Complaint
    deleteComplaint: async (complaintId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await Complaints.update(updatedData, { where: { id: complaintId } });
            // Fetch the updated complaint after the update
            const deletedComplaint = await Complaints.findOne({ where: { id: complaintId } });
            return deletedComplaint;
        } catch (error) {
            throw { message: error.message || "Error Deleting Complaint!" };
        }
    },

    // Assigning Complaints to Engineers/Resolvers
    assignmentOfComplaints: async (complaintId, req) => {
        try {
            // Create the assignment and save it in the database
            const assignmentOfComplaint = await ResolverAssignments.create({
                fkComplaintId: complaintId,
                fkAssignedById: req.fkAssignedById,
                fkAssignedResolverId: req.fkAssignedResolverId,
                assignmentRemarks: req.assignmentRemarks
            });
            await Complaints.update(
                { fkAssignedResolverId: req.fkAssignedResolverId },
                { where: { id: complaintId } }
            );
            return assignmentOfComplaint;
        } catch (error) {
            throw { message: error.message || "Error Assigning Complaint to Resolver!" };

        }
    },

    // Retrieve Complaints for Assigned Resolvers/Engineer
    retrieveAssignedComplaints: async (assigneeId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await ResolverAssignments.findAndCountAll({
                where: { fkAssignedResolverId: assigneeId },
                include: [
                    {
                        model: Users,
                        as: 'assignedBy',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: Users,
                        as: 'assignedTo',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName'],
                            }
                        ],
                        attributes: ['id']
                    },
                    {
                        model: Complaints,
                        include: [
                            {
                                model: ComplaintTypes,
                                as: 'complaintType',
                                attributes: ['id', 'complaintTypeName']
                            },
                            {
                                model: ComplaintCategories,
                                as: 'complaintCategory',
                                attributes: ['id', 'complaintCategoryName']
                            }
                        ]
                    },
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['assignmentRemarks']
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, complaints: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Complaints");
        }
    },

    // Retrieve All Employees As Engineers
    retrieveEmployeesAsEngineers: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await Employees.findAndCountAll({
                include: [
                    {
                        model: Departments,
                        as: 'employeeDepartment',
                        attributes: ['departmentName'],
                        where: {
                            departmentName: 'IT Department', // Filter by departmentName
                        },
                    },
                    {
                        model: Designations,
                        as: 'employeeDesignation',
                        attributes: ['designationName'],
                        where: {
                            designationName: 'IT Engineer', // Filter by designationName
                        },
                    },
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ],
            });

            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, employees: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Employeed as IT Engineers");
        }
    },


}

module.exports = complaintsService