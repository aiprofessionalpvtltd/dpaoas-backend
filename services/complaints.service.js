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
const Branches = db.branches
const TonerInstallations = db.tonerInstallations
const TonerModels = db.tonerModels
const Op = db.Sequelize.Op;

const logger = require('../common/winston');


const complaintsService = {
    // Issue A New Complaint
    issueComplaint: async (req) => {
        try {
            let tonerInstallation;
            let complaint;
            // Issue complaint and save it in the database
            if (req.fkTonerModelId) {

                // First, fetch the current quantity from TonerModels
                const tonerModel = await TonerModels.findOne({
                    where: { id: req.fkTonerModelId },
                    attributes: ['quantity'],
                });

                if (!tonerModel) {
                    throw new Error('TonerModel not found');
                }

                if (req.tonerQuantity > tonerModel.quantity) {
                    throw new Error('Requested toner quantity exceeds available stock');
                }
                tonerInstallation = await TonerInstallations.create({
                    requestDate: req.complaintIssuedDate ? req.complaintIssuedDate : null,
                    fkUserRequestId: req.fkComplaineeUserId ? req.fkComplaineeUserId : null,
                    userRequestName: req.userName ? req.userName : null,
                    fkBranchRequestId: req.fkComplaintTypeId ? req.fkComplaintTypeId : null,
                    fkTonerModelId: req.fkTonerModelId ? req.fkTonerModelId : null,
                    quantity: req.tonerQuantity ? req.tonerQuantity : null,
                })


                complaint = await Complaints.create({
                    userName: req.userName ? req.userName : null,
                    fkComplaineeUserId: req.fkComplaineeUserId ? req.fkComplaineeUserId : null,
                    fkComplaintTypeId: req.fkComplaintTypeId ? req.fkComplaintTypeId : null,
                    fkComplaintCategoryId: req.fkComplaintCategoryId ? req.fkComplaintCategoryId : null,
                    fkTonerModelId: req.fkTonerModelId ? req.fkTonerModelId : null,
                    complaintDescription: req.complaintDescription ? req.complaintDescription : null,
                    complaintIssuedDate: req.complaintIssuedDate ? req.complaintIssuedDate : null,
                    fkAssignedResolverId: req.fkAssignedResolverId ? req.fkAssignedResolverId : null,
                    fkTonerModelId: req.fkTonerModelId ? req.fkTonerModelId : null,
                    tonerQuantity: req.tonerQuantity ? req.tonerQuantity : null
                });
            }
            else {
                complaint = await Complaints.create({
                    userName: req.userName ? req.userName : null,
                    fkComplaineeUserId: req.fkComplaineeUserId ? req.fkComplaineeUserId : null,
                    fkComplaintTypeId: req.fkComplaintTypeId ? req.fkComplaintTypeId : null,
                    fkComplaintCategoryId: req.fkComplaintCategoryId ? req.fkComplaintCategoryId : null,
                    fkTonerModelId: req.fkTonerModelId ? req.fkTonerModelId : null,
                    complaintDescription: req.complaintDescription ? req.complaintDescription : null,
                    complaintIssuedDate: req.complaintIssuedDate ? req.complaintIssuedDate : null,
                    fkAssignedResolverId: req.fkAssignedResolverId ? req.fkAssignedResolverId : null,
                    fkTonerModelId: req.fkTonerModelId ? req.fkTonerModelId : null,
                    tonerQuantity: req.tonerQuantity ? req.tonerQuantity : null
                });
            }


            return complaint;
        } catch (error) {
            console.log(error)
            throw { message: error.message || "Error Issuing Complaint" };

        }
    },

    // Update User Complaint
    updateComplaint: async (complaintId, updateData) => {
        try {
            let updateComplaint;
            let data;

            data = {
                fkComplaineeUserId: updateData.fkComplaineeUserId ? updateData.fkComplaineeUserId : null,
                userName: updateData.userName ? updateData.userName : null,
                fkAssignedResolverId: updateData.fkAssignedResolverId ? updateData.fkAssignedResolverId : null,
                fkComplaintTypeId: updateData.fkComplaintTypeId ? updateData.fkComplaintTypeId : null,
                fkComplaintCategoryId: updateData.fkComplaintCategoryId ? updateData.fkComplaintCategoryId : null,
                complaintDescription: updateData.complaintDescription ? updateData.complaintDescription : null,
                complaintIssuedDate: updateData.complaintIssuedDate ? updateData.complaintIssuedDate : null,
                tonerQuantity: updateData.tonerQuantity ? updateData.tonerQuantity : null,
                fkTonerModelId: updateData.fkTonerModelId ? updateData.fkTonerModelId : null
            }

            updateComplaint = await Complaints.update(data, { where: { id: complaintId } });
            return updateComplaint

        } catch (error) {
            console.log(error)
            throw new Error({ message: error.message })
        }
    },

    // Resolve Complaint
    resolveComplaint: async (complaintId, updateData, file) => {
        try {

            let resolvedComplaint;
            let data;
            data = {
                // fkComplaineeUserId: updateData.fkComplaineeUserId ? updateData.fkComplaineeUserId : null,
                // userName: updateData.userName ? updateData.userName : null,
                // fkAssignedResolverId: updateData.fkAssignedResolverId ? updateData.fkAssignedResolverId : null,
                // fkComplaintTypeId: updateData.fkComplaintTypeId ? updateData.fkComplaintTypeId : null,
                // fkComplaintCategoryId: updateData.fkComplaintCategoryId ? updateData.fkComplaintCategoryId : null,
                // complaintDescription: updateData.complaintDescription ? updateData.complaintDescription : null,
                // complaintIssuedDate: update.complaintIssuedDate ? updateData.complaintIssuedDate : null,
                fkResolverUserId: updateData.fkResolverUserId ? updateData.fkResolverUserId : null,
                complaintResolvedDate: updateData.complaintResolvedDate ? updateData.complaintResolvedDate : null,
                complaintRemark: updateData.complaintRemark ? updateData.complaintRemark : null,
                complaintStatus: updateData.complaintStatus ? updateData.complaintStatus : null,
                tonerQuantity: updateData.tonerQuantity ? updateData.tonerQuantity : null,
                fkTonerModelId: updateData.fkTonerModelId ? updateData.fkTonerModelId : null
            }

            if (file) {
                const complaintAttachmentFromResolver = file.destination.replace('./public/', '/public/') + file.originalname;
                data.complaintAttachmentFromResolver = complaintAttachmentFromResolver;
            }

            if (data.fkTonerModelId !== null && data.complaintStatus === 'closed') {
                if (data.tonerQuantity && !isNaN(data.tonerQuantity)) {
                    await TonerModels.update(
                        { quantity: db.Sequelize.literal(`quantity - ${data.tonerQuantity}`) },
                        { where: { id: data.fkTonerModelId } }
                    );
                    resolvedComplaint = await Complaints.update(data, { where: { id: complaintId } });
                } else {
                    resolvedComplaint = await Complaints.update(data, { where: { id: complaintId } });
                }
            }
            else {
                resolvedComplaint = await Complaints.update(data, { where: { id: complaintId } });
            }
            return resolvedComplaint;
        } catch (error) {
            console.log(error)
            throw { message: error.message || `Error Resolving Complaint:${complaintId}` };
        }
    },

    // resolveComplaint: async (complaintId, updateData) => {
    //     try {
    //         let resolvedComplaint;

    //         // Check if complaintStatus is 'closed'
    //         if (updateData.complaintStatus === 'closed') {
    //             // Check if fkTonerModelId is not null and tonerQuantity is provided and is a valid number
    //             if (updateData.fkTonerModelId !== null) {
    //                 if (updateData.tonerQuantity && !isNaN(updateData.tonerQuantity)) {
    //                     // Decrement the quantity by the value of tonerQuantity
    //                     await TonerModels.update(
    //                         { quantity: db.Sequelize.literal(`quantity - ${updateData.tonerQuantity}`) },
    //                         { where: { id: updateData.fkTonerModelId } }
    //                     );
    //                 } else {
    //                     throw new Error('Invalid tonerQuantity provided');
    //                 }
    //             }

    //             // Update the Complaints table
    //             resolvedComplaint = await Complaints.update(updateData, { where: { id: complaintId } });
    //         } else if (updateData.tonerQuantity === null && updateData.fkTonerModelId === null) {
    //             console.log("Toner Quantity")
    //             // If tonerQuantity and fkTonerModelId are both null, update the Complaints table
    //             resolvedComplaint = await Complaints.update(updateData, { where: { id: complaintId } });
    //         } else {
    //             throw new Error('Invalid data provided');
    //         }

    //         return resolvedComplaint;
    //     } catch (error) {
    //         throw { message: error.message || `Error Resolving Complaint: ${complaintId}` };
    //     }
    // },    

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
                        model: Branches,
                        as: 'complaintType',
                        attributes: ['id', 'branchName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['id', 'complaintCategoryName']
                    },
                    {
                        model: TonerModels,
                        as: 'tonerModels',
                        attributes: ['id', 'tonerModel', 'quantity']
                    }
                ],

                offset,
                limit,

                order: [
                    [db.Sequelize.literal(`CASE WHEN "complaints"."complaintStatus" = 'pending' THEN 1 ELSE 2 END`), 'ASC'],
                    ['createdAt', 'DESC']
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
                        model: Branches,
                        as: 'complaintType',
                        attributes: ['id', 'branchName']
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
                where: { fkAssignedToUserId: complaineeUserIds },
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
                        model: Branches,
                        as: 'complaintType',
                        attributes: ['id', 'branchName']
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
                        model: Branches,
                        as: 'complaintType',
                        attributes: ['id', 'branchName']
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
                        model: Branches,
                        as: 'complaintType',
                        attributes: ['id', 'branchName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['id', 'complaintCategoryName']
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
                if (key === 'userName') {
                    queryOptions.where['$complaints.userName$'] = { [Op.iLike]: `%${searchCriteria.userName}%` };
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
            // console.log(error)
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
                        model: Branches,
                        as: 'complaintType',
                        attributes: ['id', 'branchName']
                    },
                    {
                        model: ComplaintCategories,
                        as: 'complaintCategory',
                        attributes: ['id', 'complaintCategoryName']
                    },
                    {
                        model: TonerModels,
                        as: 'tonerModels',
                        attributes: ['id','tonerModel']
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
                fkAssignedById: req.fkAssignedById ? req.fkAssignedById : null,
                userAssignedName: req.userAssignedName ? req.userAssignedName : null,
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
                                model: Branches,
                                as: 'complaintType',
                                attributes: ['id', 'branchName']
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
                        model: Branches,
                        as: 'branches',
                        attributes: ['branchName'],
                        where: {
                            branchName: 'IT', // Filter by branchName
                        },
                    },
                    {
                        model: Designations,
                        as: 'designations',
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