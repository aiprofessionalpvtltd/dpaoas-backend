const db = require("../models");
const Divisions = db.divisions;
const Branches = db.branches
const Ministries = db.ministries
const FreshReceipts = db.freshReceipts
const FileDiaries = db.fileDiaries
const FreshReceiptAttachments = db.freshReceiptsAttachments
const FreshReceiptRemarks = db.freshReceiptRemarks
const Users = db.users
const Employee = db.employees
const Designations = db.designations
const Op = db.Sequelize.Op;
const logger = require('../common/winston');
const { PageSizes } = require("pdf-lib");

const freshReceiptService = {

    // Create New Fresh Receipt (FR)
    createFR: async (req, files, userId) => {
        try {
            // Create the FR and save it in the database
            const fr = await FreshReceipts.create({
                frType: req.frType,
                fkBranchId: req.fkBranchId,
                fkMinistryId: req.fkMinistryId,
                frSubject: req.frSubject,
                referenceNumber: req.referenceNumber,
                frDate: req.frDate,
                shortDescription: req.shortDescription,
                createdBy: userId,
                fkUserBranchId: req.fkUserBranchId
            })
            await FileDiaries.create({
                diaryType: req.diaryType,
                diaryNumber: req.diaryNumber,
                diaryDate: req.diaryDate,
                diaryTime: req.diaryTime,
                fkFreshReceiptId: fr.id
            })

            if (files && files.length > 0) {
                const attachments = files.map(file => {
                    const path = file.destination.replace('./public/', '/public/');
                    return {
                        filename: `${path}/${file.filename}`,
                        fkFreshReceiptId: fr.id,
                    };
                });
                await FreshReceiptAttachments.bulkCreate(attachments);
            }

            return fr
        } catch (error) {
            throw { message: error.message || "Error Creating FR!" };

        }
    },

    // Get All FRs On User Basis
    getAllFRs: async (currentPage, pageSize, userId) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await FreshReceipts.findAndCountAll({
                include: [
                    {
                        model: FreshReceiptAttachments,
                        as: 'freshReceiptsAttachments',
                        attributes: ['id', 'filename']
                    },
                    {
                        model: FreshReceiptRemarks,
                        as: 'freshReceipt',
                        attributes: ['id', 'CommentStatus', 'comment', 'submittedBy', 'assignedTo', 'createdAt', 'updatedAt'],
                        include: [
                            {
                                model: Users,
                                as: 'submittedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',

                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                model: Users,
                                as: 'assignedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',

                                            }
                                        ]
                                    }
                                ]
                            },

                        ]
                    },
                    {
                        model: FileDiaries,
                        as: 'freshReceiptDiaries',
                        attributes: ['id', 'fileNumber', 'diaryNumber', 'diaryType', 'diaryDate', 'diaryTime'],
                    },
                    {
                        model: Branches,
                        as: 'userBranches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Ministries,
                        as: 'ministries',
                        attributes: ['id', 'ministryName'],
                    },
                ],
                offset,
                limit,
                distinct: true,
                order: [
                    ['id','ASC']
                ]
            });

            // const filteredFRs = rows.filter(section => {
            //     const caseData = section || {};
            //     const remarks = caseData.freshReceipt || [];
            //     const isCreatedByUser = parseInt(caseData.createdBy) === parseInt(userId);
            //     const isAssignedToUser = remarks.some(remark => parseInt(remark.assignedTo) === parseInt(userId));
            //     return isAssignedToUser || (isCreatedByUser && !remarks.some(remark => parseInt(remark.assignedTo)));
            // });

            const filteredFRs = rows.filter(section => {
                const caseData = section || {};
                const remarks = caseData.freshReceipt || [];
                const isCreatedByUser = parseInt(caseData.createdBy) === parseInt(userId);
                const lastRemark = remarks.reduce((latest, remark) => {
                    return latest.createdAt > remark.createdAt ? latest : remark;
                }, { createdAt: new Date(0) });
                const isAssignedToUser = parseInt(lastRemark.assignedTo) === parseInt(userId);
                return isAssignedToUser || (isCreatedByUser && !remarks.some(remark => remark.assignedTo));
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count: filteredFRs.length, totalPages, freshReceipts: filteredFRs };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All FRs");
        }
    },

    getAllFRsByBranch: async (branchId) => {
        try {

            const freshReceipts = await FreshReceipts.findAll({
                where: {
                    fkUserBranchId: branchId,
                },
                include: [
                    {
                        model: FreshReceiptAttachments,
                        as: 'freshReceiptsAttachments',
                        attributes: ['id', 'filename']
                    },
                    {
                        model: FreshReceiptRemarks,
                        as: 'freshReceipt',
                        attributes: ['id', 'CommentStatus', 'comment', 'submittedBy', 'assignedTo', 'createdAt', 'updatedAt'],
                        include: [
                            {
                                model: Users,
                                as: 'submittedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',

                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                model: Users,
                                as: 'assignedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',

                                            }
                                        ]
                                    }
                                ]
                            },

                        ]
                    },
                    {
                        model: FileDiaries,
                        as: 'freshReceiptDiaries',
                        attributes: ['id', 'fileNumber', 'diaryNumber', 'diaryType', 'diaryDate', 'diaryTime'],
                    },
                    {
                        model: Branches,
                        as: 'userBranches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Ministries,
                        as: 'ministries',
                        attributes: ['id', 'ministryName'],
                    },
                ],
                distinct: true,
                order: [['id', 'ASC']]
            });


            return freshReceipts
        } catch (error) {
            throw new Error(error.message || "Error Fetching All FRs");
        }
    },

    //Get Frs History On The Basis of Branch
    getFRsHistory: async (branchId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await FreshReceipts.findAndCountAll({
                where: {
                    fkUserBranchId: branchId
                },
                include: [
                    {
                        model: FreshReceiptAttachments,
                        as: 'freshReceiptsAttachments',
                        attributes: ['id', 'filename']
                    },
                    {
                        model: FreshReceiptRemarks,
                        as: 'freshReceipt',
                        attributes: ['id', 'CommentStatus', 'comment', 'createdAt', 'updatedAt'],
                        include: [
                            {
                                model: Users,
                                as: 'submittedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName']
                                    }
                                ]
                            },
                            {
                                model: Users,
                                as: 'assignedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName']
                                    }
                                ]
                            },
                        ],
                    },
                    {
                        model: FileDiaries,
                        as: 'freshReceiptDiaries',
                        attributes: ['id', 'fileNumber', 'diaryNumber', 'diaryType', 'diaryDate', 'diaryTime'],
                    },
                    {
                        model: Branches,
                        as: 'userBranches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Ministries,
                        as: 'ministries',
                        attributes: ['id', 'ministryName'],
                    },
                ],
                offset,
                limit,
                distinct: true,
                order: [
                    ['id', 'ASC'],
                ]
            });


            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, freshReceipts: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching FRs History");
        }
    },

    // Get Single FR
    getSingleFR: async (freshReceiptId) => {
        try {
            const result = await FreshReceipts.findOne({
                raw: false,
                where: {
                    id: freshReceiptId
                },
                include: [
                    {
                        model: FreshReceiptAttachments,
                        as: 'freshReceiptsAttachments',
                        attributes: ['id', 'filename']
                    },
                    {
                        model: FreshReceiptRemarks,
                        as: 'freshReceipt',
                        attributes: ['id', 'CommentStatus', 'comment'],
                        include: [
                            {
                                model: Users,
                                as: 'submittedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',

                                            }
                                        ]
                                    },

                                ]
                            },
                            {
                                model: Users,
                                as: 'assignedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',

                                            }
                                        ]
                                    }
                                ]
                            },

                        ]
                    },
                    {
                        model: FileDiaries,
                        as: 'freshReceiptDiaries',
                        attributes: ['id', 'fileNumber', 'diaryNumber', 'diaryType', 'diaryDate', 'diaryTime'],
                    },
                    {
                        model: Branches,
                        as: 'userBranches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName'],
                    },
                    {
                        model: Ministries,
                        as: 'ministries',
                        attributes: ['id', 'ministryName'],
                    },
                ],
            });

            if (!result) {
                throw ({ message: "File Receipt Not Found!" })
            }
            return result
        } catch (error) {
            console.error('Error Fetching File Receipt:', error.message);
        }
    },

    // Update FR
    updateFR: async (req, files, freshReceiptId) => {
        try {
            // Create the FR and save it in the database
            await FreshReceipts.update({
                frType: req.frType,
                fkBranchId: req.fkBranchId,
                fkMinistryId: req.fkMinistryId,
                frSubject: req.frSubject,
                referenceNumber: req.referenceNumber,
                frDate: req.frDate,
                shortDescription: req.shortDescription
                // createdBy: req.createdBy
            }, {
                where: { id: freshReceiptId }
            })
            await FileDiaries.update({
                diaryType: req.diaryType,
                diaryNumber: req.diaryNumber,
                diaryDate: req.diaryDate,
                diaryTime: req.diaryTime,
                fkFreshReceiptId: freshReceiptId
            }, {
                where: { fkFreshReceiptId: freshReceiptId }
            })

            // Remove existing attachments for this FR
            await FreshReceiptAttachments.destroy({
                where: { fkFreshReceiptId: freshReceiptId }
            });

            if (files && files.length > 0) {
                const attachments = files.map(file => {
                    const path = file.destination.replace('./public/', '/public/');
                    return {
                        filename: `${path}/${file.filename}`,
                        fkFreshReceiptId: freshReceiptId,
                    };
                });
                await FreshReceiptAttachments.bulkCreate(attachments);
            }

            // Return the updated FR details
            const updatedFR = await FreshReceipts.findOne({ where: { id: freshReceiptId } });
            return updatedFR;
        } catch (error) {
            throw { message: error.message || "Error Creating FR!" };

        }
    },

    // Assign FR
    assignFR: async (freshReceiptId, req) => {
        try {

            // Create the fileRemark
            const frRemarks = await FreshReceiptRemarks.create({
                fkFreshReceiptId: freshReceiptId,
                submittedBy: req.submittedBy,
                assignedTo: req.assignedTo,
                CommentStatus: req.CommentStatus,
                comment: req.comment
            });
            return frRemarks;
        } catch (error) {
            throw new Error(error.message || "Error Creating Case!");
        }
    },

    // Delete FR
    deleteFR: async (freshReceiptId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await FreshReceipts.update(updatedData, { where: { id: freshReceiptId } });
            // Fetch the updated FR after the update
            const deletedFR = await FreshReceipts.findOne({ where: { id: freshReceiptId } });
            return deletedFR;
        } catch (error) {
            throw { message: error.message || "Error Deleting FR!" };
        }
    }
}


module.exports = freshReceiptService