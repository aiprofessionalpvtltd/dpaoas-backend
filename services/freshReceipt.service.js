const db = require("../models");
const Divisions = db.divisions;
const Branches = db.branches
const BranchHierarchy = db.branchHierarchies
const Ministries = db.ministries
const FreshReceipts = db.freshReceipts
const FilesNotifications = db.filesNotifications
const FileDiaries = db.fileDiaries
const FreshReceiptAttachments = db.freshReceiptsAttachments
const FreshReceiptRemarks = db.freshReceiptRemarks
const Users = db.users
const Employee = db.employees
const Designations = db.designations
const ExternalMinistries = db.externalMinistries
const Cases = db.cases
const Op = db.Sequelize.Op;
const logger = require('../common/winston');
const { error } = require("../validation/userValidation");
const { PageSizes } = require("pdf-lib");
const moment = require('moment-timezone');
const freshReceiptService = {


        // Create External Ministries
        createExternalMinistry: async (req) => {
            try {
    
                const externalMinistry = await ExternalMinistries.create({
                    receivedFrom: req.receivedFrom ? req.receivedFrom : null,
                    description: req.description ? req.description : null
                })
                return externalMinistry
            } catch (error) {
                throw { message: error.message || "Error Creating externalMinistry!" };
    
            }
        },

    // Create New Fresh Receipt (FR)
    createFR: async (req, files, userId) => {
        try {
            // Create the FR and save it in the database
            const fr = await FreshReceipts.create({
                frType: req.frType,
                fkBranchId: req.fkBranchId,
                fkMinistryId: req.fkMinistryId ? req.fkMinistryId : null,
                frSubject: req.frSubject,
                referenceNumber: req.referenceNumber,
                frDate: req.frDate,
                shortDescription: req.shortDescription,
                createdBy: userId,
                fkUserBranchId: req.fkUserBranchId,
                fkExternalMinistryId: req.fkExternalMinistryId ? req.fkExternalMinistryId : null,
                frSubType: req.frSubType ? req.frSubType : null
            })

            // const existingDiaryNumber = await FileDiaries.findOne({
            //     where: { diaryNumber: req.diaryNumber }
            // })

            // if (existingDiaryNumber) {
            //     throw new Error('Diary Number already exists')
            // }

            await FileDiaries.create({
                diaryType: req.diaryType ? req.diaryType : "null",
                diaryNumber: req.diaryNumber ? req.diaryNumber : null,
                diaryDate: req.diaryDate ? req.diaryDate : null,
                diaryTime: req.diaryTime ? req.diaryTime : null,
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

    // Upload Multiple FRs
    uploadMultipleFRs: async (files, freshReceiptId) => {
        try {
            if (files && files.length > 0) {
                const attachments = files.map(file => {
                    const path = file.destination.replace('./public/', '/public/');
                    return {
                        filename: `${path}/${file.filename}`,
                        fkFreshReceiptId: freshReceiptId,
                    };
                });
                return await FreshReceiptAttachments.bulkCreate(attachments);
            }

            //   return fr
        } catch (error) {
            throw { message: error.message || "Error Creating FR!" };

        }
    },

    // Get Current User's Designation
    getCurrentUserPosition: async (userId) => {
        const user = await Users.findOne({
            where: { id: userId },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id'],
                include: [{
                    model: Designations,
                    as: 'designations'
                }]
            }]
        });

        if (user && user.employee.designations) {
            return user.employee.designations.designationName;
        } else {
            throw new Error('User or designation not found');
        }
    },

    // Get Current User's Branch
    getCurrentUserBranch: async (userId) => {
        const user = await Users.findOne({
            where: { id: userId },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id'],
                include: [{
                    model: Branches,
                    as: 'branches'
                }]
            }]
        });

        if (user && user.employee.branches) {
            return {
                id: user.employee.branches.id,
                branchName: user.employee.branches.branchName
            };
        } else {
            throw new Error('User or designation not found');
        }
    },

    // Get All FRs On User Basis
    getAllFRs: async (currentPage, pageSize, userId) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const currentUserPosition = await freshReceiptService.getCurrentUserPosition(userId);
            const currentUserBranch = await freshReceiptService.getCurrentUserBranch(userId);
            const { count, rows } = await FreshReceipts.findAndCountAll({
                where: {
                    fkUserBranchId: currentUserBranch.id,
                    // Add the NOT EXISTS condition to check the Cases table
                    '$notExists$': db.sequelize.literal(`NOT EXISTS (SELECT 1 FROM "cases" WHERE "cases"."fkFreshReceiptId" = "freshReceipts"."id")`)
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
                        separate: true,
                        attributes: ['id', 'CommentStatus', 'comment', 'submittedBy', 'assignedTo', 'createdAt', 'updatedAt'],
                       
                        order: [
                            ['id', 'DESC']
                        ],
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
                                                attributes: ['id', 'designationName']
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
                                                attributes: ['id', 'designationName']
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
                    {
                        model: ExternalMinistries,
                        as: 'externalMinistry',
                        attributes: ['id', 'receivedFrom']
                    }
                ],
                offset,
                limit,
                distinct: true,
                order: [
                    ['id', 'DESC']
                ]
            });
    
            const branchHierarchyData = await BranchHierarchy.findOne({
                where: { branchName: currentUserBranch.branchName },
                attributes: ['id', 'branchHierarchy', 'higherLevelHierarchy', 'lowerLevelHierarchy']
            });
    
            const lowerLevelHierarchy = branchHierarchyData.lowerLevelHierarchy;
            const higherLevelHierarchy = branchHierarchyData.higherLevelHierarchy;
    
            let isVisible = false;
            let isEditable = true;
    
            const filterConditions = await Promise.all(rows.map(async (fr) => {
                const remarks = fr.freshReceipt || [];
                const createdBy = fr.createdBy || 0;
                // let isVisible = parseInt(userId) === createdBy && remarks.length > 0;
                // let isEditable = isVisible && remarks.length === 0;
    
                 // Initial visibility is only for the creator
        if (parseInt(userId) === createdBy) {
            isVisible = true;
            isEditable = remarks.length === 0; // Creator can edit if no remarks
                }

                
                // Determine the latest remark
                // if (remarks.length > 0) {
                //     const latestRemark = remarks.reduce((latest, remark) => {
                //         return (latest.createdAt > remark.createdAt) ? latest : remark;
                //     }, { createdAt: new Date(0), assignedTo: null });
    
                //     isVisible = isVisible || parseInt(latestRemark.assignedTo) === parseInt(userId);
    
                //     if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
                //         isEditable = true;
                //     } else {
                //         isEditable = false;
                //     }
                // }
                if (remarks.length > 0) {
                    const latestRemark = remarks.reduce(
                      (latest, remark) => {
                        return latest.createdAt > remark.createdAt ? latest : remark;
                      },
                      { createdAt: new Date(0), assignedTo: null }
                    );
          
                    // If there is a latest remark, check if the user is the one it's assigned to
                    if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
                      isVisible = true; // The assigned user can also see the case
                      isEditable = true; // The assigned user can edit the case
                    } else {
                      // Ensure the creator retains visibility even when not the latest assigned
                      // isVisible = isVisible || parseInt(createdBy) === parseInt(userId);
                      isVisible = false;
                      isEditable = false; // Creator cannot edit once assigned to someone else
                    }
                  }
    
                return { isVisible, isEditable };
            }));
    
            // Filter the FRs based on visibility and update with editability
            const filteredFRs = rows.filter((fr, index) => {
                const condition = filterConditions[index];
                fr.isEditable = condition.isEditable;
                return condition.isVisible;
            });
    
            const paginatedFRs = filteredFRs.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
            const totalPages = Math.ceil(filteredFRs.length / pageSize);
    
            return { count: paginatedFRs.length, totalPages, freshReceipts: paginatedFRs};
    
        } catch (error) {
            throw new Error(error.message || "Error Fetching All FRs");
        }
    },
    
    // Retrieve External Ministry
    getAllExternalMinistries: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await ExternalMinistries.findAndCountAll({
                offset,
                limit,
                distinct: true,
                order: [
                    ['id', 'DESC']
                ]
            });

            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, externalMinistries: rows };

        } catch (error) {
            console.log(error)
            throw { message: error.message };

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
                                                attributes: ['id', 'designationName']
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
                                                attributes: ['id', 'designationName']
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
                    {
                        model: ExternalMinistries,
                        as: 'externalMinistry',
                        attributes: ['id','receivedFrom']
                    }
                ],
                distinct: true,
                order: [['id', 'DESC']]
            });


            return freshReceipts
        } catch (error) {
            throw new Error(error.message || "Error Fetching All FRs");
        }
    },

    //Get Frs History On The Basis of Branch
    getFRsHistory: async (branchId,userId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await FreshReceipts.findAndCountAll({
                where: {
                    fkUserBranchId: branchId,
                    '$notExists$': db.sequelize.literal(`NOT EXISTS (SELECT 1 FROM "cases" WHERE "cases"."fkFreshReceiptId" = "freshReceipts"."id")`),
                    createdBy : userId
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
                        separate: true,
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
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',
                                                attributes: ['id', 'designationName']
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
                    {
                        model: ExternalMinistries,
                        as: 'externalMinistry',
                        attributes: ['id','receivedFrom']
                    }
                ],
                offset,
                limit,
                distinct: true,
                order: [
                    ['id', 'DESC'],
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
                                        attributes: ['id', 'firstName', 'lastName', 'userType'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',

                                            }
                                        ]
                                    },

                                ],
                            },
                            {
                                model: Users,
                                as: 'assignedUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employee,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName', 'userType'],
                                        include: [
                                            {
                                                model: Designations,
                                                as: 'designations',
                                                attributes: ['id', 'designationName']

                                            }
                                        ]
                                    }
                                ],

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
                    {
                        model: ExternalMinistries,
                        as: 'externalMinistry',
                        attributes: ['id','receivedFrom']
                    }
                ],
                order: [[{ model: FreshReceiptRemarks, as: 'freshReceipt' }, 'id', 'DESC']],
            });

            result.freshReceipt.forEach(remark => {
                const formattedDateCreatedAt = moment(remark.createdAt).tz('Asia/Karachi').format("DD-MM-YYYY");
                const formattedTimeCreatedAt = moment(remark.createdAt).tz('Asia/Karachi').format("hh:mm A");
                remark.dataValues.formattedDateCreatedAt = formattedDateCreatedAt;
                remark.dataValues.formattedTimeCreatedAt = formattedTimeCreatedAt
            });

            if (!result) {
                throw ({ message: "Fresh Receipt Not Found!" })
            }
            return result
        } catch (error) {
            console.error('Error Fetching Fresh Receipt:', error.message);
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
                shortDescription: req.shortDescription,
                frSubType : req.frSubType,
                fkExternalMinistryId: req.fkExternalMinistryId,
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

            if (files && files.length > 0) {
                // Remove existing attachments for this FR
                await FreshReceiptAttachments.destroy({
                    where: { fkFreshReceiptId: freshReceiptId }
                });

                // Check if files array has elements
                if (files.length > 0) {
                    const attachments = files.map(file => {
                        const path = file.destination.replace('./public/', '/public/');
                        return {
                            filename: `${path}/${file.filename}`,
                            fkFreshReceiptId: freshReceiptId,
                        };
                    });
                    await FreshReceiptAttachments.bulkCreate(attachments);
                }
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
                CommentStatus: req.CommentStatus ? req.CommentStatus : null,
                comment: req.comment ? req.comment : null
            });

            // Create the File Notification
            await FilesNotifications.create({
                fkUserId: req.assignedTo,
                readStatus: false,
                fkFreshReceiptId: freshReceiptId,
            })
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
    },





}


module.exports = freshReceiptService