const db = require("../models");
const Files = db.newFiles
const Cases = db.cases
const FilesNotifications = db.filesNotifications
const Users = db.users
const Employees = db.employees
const Designations = db.designations
const FilesRegisters = db.fileRegisters
const FileRemarks = db.fileRemarks
const FRRemarks = db.freshReceiptRemarks
const FreshReceipts = db.freshReceipts
const mainHeadingFiles = db.mainHeadingFiles
const BranchHierarchy = db.branchHierarchies
const moment = require('moment');
const Op = db.Sequelize.Op;
const { where, fn, cast, col } = require('sequelize');

const filesDashboardService = {

    // Stats for File In and File Out Stats
    getFilesStats: async () => {
        try {
            const today = moment().format('YYYY-MM-DD');
            // Define all file types
            const allFileTypes = ['Urgent', 'Priority', 'Immediate', 'Routine'];

            // Initialize empty objects to store counts
            let filesIn = {};
            let filesOut = {};

            // Populate filesIn and filesOut objects with counts
            const filesStats = await Files.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                },
                attributes: [
                    'fileStatus',
                    'fileType',
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                group: ['fileStatus', 'fileType']
            });

            filesStats.forEach(stat => {
                const status = stat.fileStatus;
                const type = stat.fileType;
                const count = parseInt(stat.get('count'));

                if (status === 'fileIn') {
                    filesIn[type] = count;
                } else if (status === 'fileOut') {
                    filesOut[type] = count;
                }
            });

            // Fill in missing file types with count 0
            allFileTypes.forEach(type => {
                if (!filesIn[type]) {
                    filesIn[type] = 0;
                }
                if (!filesOut[type]) {
                    filesOut[type] = 0;
                }
            });

            // Combine filesIn and filesOut objects into stats object
            const stats = { filesIn, filesOut };

            return stats;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Files Stats");
        }
    },

    // Stats For Files Sent And Received
    // getFileSentAndReceivedStats: async (userId) => {
    //     try {

    //         const today = moment().format('YYYY-MM-DD');
    //         // Count sent files where sumittedBy is the userId
    //         const sentFiles = await FileRemarks.findAndCountAll({
    //             where: {
    //                 submittedBy: userId,
    //                 createdAt: {
    //                     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
    //                 }
    //             },
    //             include: [
    //                 {
    //                     model: Users,
    //                     as: 'submittedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //                 {
    //                     model: Users,
    //                     as: 'assignedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //                 {
    //                     model: Files,
    //                     as: 'file',
    //                     include: [
    //                         {
    //                             model: FilesRegisters,
    //                             as: 'fileRegister',
    //                             attributes: ['id', 'registerNumber', 'year', 'registerSubject'],
    //                         },
    //                         {
    //                             model: mainHeadingFiles,
    //                             as: 'mainHeading',
    //                             attributes: ['id', 'mainHeading', 'mainHeadingNumber']
    //                         }
    //                     ]
    //                 }
    //             ]
    //         });

    //         // Count received files where assignedTo is the userId
    //         const receivedFiles = await FileRemarks.findAndCountAll({
    //             where: {
    //                 assignedTo: userId,
    //                 createdAt: {
    //                     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
    //                 }
    //             },
    //             include: [
    //                 {
    //                     model: Users,
    //                     as: 'submittedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //                 {
    //                     model: Users,
    //                     as: 'assignedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //                 {
    //                     model: Files,
    //                     as: 'file',
    //                     include: [
    //                         {
    //                             model: FilesRegisters,
    //                             as: 'fileRegister',
    //                             attributes: ['id', 'registerNumber', 'year', 'registerSubject'],
    //                         },

    //                         {
    //                             model: mainHeadingFiles,
    //                             as: 'mainHeading',
    //                             attributes: ['id', 'mainHeading', 'mainHeadingNumber']
    //                         }
    //                     ]
    //                 }
    //             ]
    //         });


    //         const totalFiles = sentFiles.count + receivedFiles.count;

    //         // Create the stats object
    //         const stats = {
    //             sentFiles: { count: sentFiles.count, rows: sentFiles.rows },
    //             receivedFiles: { count: receivedFiles.count, rows: receivedFiles.rows },
    //             totalFiles: totalFiles
    //         };

    //         return stats;
    //     } catch (error) {
    //         throw new Error(error.message || "Error Retrieving Files Approval Stats");
    //     }
    // },

    getFileSentAndReceivedStats: async (userId) => {
        try {
            const today = moment().format('YYYY-MM-DD');
    
            // Define all possible priorities
            const priorities = ['Confidential', 'Immediate', 'Routine'];
    
            // Count sent files where submittedBy is the userId and group by priority
            const sentFiles = await FileRemarks.findAll({
                where: {
                    submittedBy: userId,
                    // Uncomment the createdAt filter if needed
                    // createdAt: {
                    //     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    // }
                },
                attributes: ['priority', [db.sequelize.fn('COUNT', db.sequelize.col('priority')), 'count']],
                group: ['priority']
            });
    
            // Count received files where assignedTo is the userId and group by priority
            const receivedFiles = await FileRemarks.findAll({
                where: {
                    assignedTo: userId,
                    // Uncomment the createdAt filter if needed
                    // createdAt: {
                    //     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    // }
                },
                attributes: ['priority', [db.sequelize.fn('COUNT', db.sequelize.col('priority')), 'count']],
                group: ['priority']
            });
    
            // Initialize counts for each priority
            const sentPriorityCounts = priorities.reduce((acc, priority) => {
                acc[priority] = 0;
                return acc;
            }, {});
    
            const receivedPriorityCounts = priorities.reduce((acc, priority) => {
                acc[priority] = 0;
                return acc;
            }, {});
    
            // Update with actual counts from the query results
            sentFiles.forEach(file => {
                sentPriorityCounts[file.priority] = parseInt(file.dataValues.count);
            });
    
            receivedFiles.forEach(file => {
                receivedPriorityCounts[file.priority] = parseInt(file.dataValues.count);
            });
    
            // Calculate total counts
            const totalSentFiles = Object.values(sentPriorityCounts).reduce((acc, count) => acc + count, 0);
            const totalReceivedFiles = Object.values(receivedPriorityCounts).reduce((acc, count) => acc + count, 0);
            const totalFiles = totalSentFiles + totalReceivedFiles;
    
            // Format the stats object
            const stats = {
                sentFiles: {
                    totalCount: totalSentFiles,
                    priorityCounts: sentPriorityCounts
                },
                receivedFiles: {
                    totalCount: totalReceivedFiles,
                    priorityCounts: receivedPriorityCounts
                },
                totalFiles: totalFiles
            };
    
            return stats;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Files Approval Stats");
        }
    },
    

    // Stats For FRs Sent And Received
    // getFRSentAndReceivedStats: async (userId) => {
    //     try {

    //         const today = moment().format('YYYY-MM-DD');
    //         // Count sent files where sumittedBy is the userId
    //         const sentFRs = await FRRemarks.findAndCountAll({
    //             where: {
    //                 submittedBy: userId,
    //                 createdAt: {
    //                     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
    //                 }
    //             },
    //             include: [
    //                 {
    //                     model: FreshReceipts,
    //                     as: 'freshReceipt'
    //                 },
    //                 {
    //                     model: Users,
    //                     as: 'submittedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //                 {
    //                     model: Users,
    //                     as: 'assignedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //             ]
    //         });

    //         // Count received files where assignedTo is the userId
    //         const receivedFRs = await FRRemarks.findAndCountAll({
    //             where: {
    //                 assignedTo: userId,
    //                 createdAt: {
    //                     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
    //                 }
    //             },
    //             include: [
    //                 {
    //                     model: FreshReceipts,
    //                     as: 'freshReceipt'
    //                 },
    //                 {
    //                     model: Users,
    //                     as: 'submittedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //                 {
    //                     model: Users,
    //                     as: 'assignedUser',
    //                     attributes: ['id'],
    //                     include: [{
    //                         model: Employees,
    //                         as: 'employee',
    //                         attributes: ['id', 'firstName', 'lastName'],
    //                         include: [{
    //                             model: Designations,
    //                             as: 'designations',
    //                             attributes: ['id', 'designationName']
    //                         }]
    //                     }]
    //                 },
    //             ]
    //         });


    //         const totalFRs = sentFRs.count + receivedFRs.count;

    //         // Create the stats object
    //         const stats = {
    //             sentFRs: { count: sentFRs.count, rows: sentFRs.rows },
    //             receivedFRs: { count: receivedFRs.count, rows: receivedFRs.rows },
    //             totalFRs: totalFRs
    //         };

    //         return stats;
    //     } catch (error) {
    //         throw new Error(error.message || "Error Retrieving Files Approval Stats");
    //     }
    // },

    getFRSentAndReceivedStats: async (userId) => {
        try {
            const today = moment().format('YYYY-MM-DD');
    
            // Define all possible priorities
            const priorities = ['Confidential', 'Immediate', 'Routine'];
    
            // Count sent files where submittedBy is the userId and group by priority
            const sentFRs = await FRRemarks.findAll({
                where: {
                    submittedBy: userId,
                    // Uncomment the createdAt filter if needed
                    // createdAt: {
                    //     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    // }
                },
                attributes: ['priority', [db.sequelize.fn('COUNT', db.sequelize.col('priority')), 'count']],
                group: ['priority']
            });
    
            // Count received files where assignedTo is the userId and group by priority
            const receivedFRs = await FRRemarks.findAll({
                where: {
                    assignedTo: userId,
                    // Uncomment the createdAt filter if needed
                    // createdAt: {
                    //     [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    // }
                },
                attributes: ['priority', [db.sequelize.fn('COUNT', db.sequelize.col('priority')), 'count']],
                group: ['priority']
            });
    
            // Initialize counts for each priority
            const sentPriorityCounts = priorities.reduce((acc, priority) => {
                acc[priority] = 0;
                return acc;
            }, {});
    
            const receivedPriorityCounts = priorities.reduce((acc, priority) => {
                acc[priority] = 0;
                return acc;
            }, {});
    
            // Update with actual counts from the query results
            sentFRs.forEach(fr => {
                sentPriorityCounts[fr.priority] = parseInt(fr.dataValues.count);
            });
    
            receivedFRs.forEach(fr => {
                receivedPriorityCounts[fr.priority] = parseInt(fr.dataValues.count);
            });
    
            // Calculate total counts
            const totalSentFRs = Object.values(sentPriorityCounts).reduce((acc, count) => acc + count, 0);
            const totalReceivedFRs = Object.values(receivedPriorityCounts).reduce((acc, count) => acc + count, 0);
            const totalFRs = totalSentFRs + totalReceivedFRs;
    
            // Format the stats object
            const stats = {
                sentFRs: {
                    totalCount: totalSentFRs,
                    priorityCounts: sentPriorityCounts
                },
                receivedFRs: {
                    totalCount: totalReceivedFRs,
                    priorityCounts: receivedPriorityCounts
                },
                totalFRs: totalFRs
            };
    
            return stats;
    
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Files Approval Stats");
        }
    },
    
    

    // Stats For File Approved and Disapproved
    getFileApprovalStats: async (userId) => {
        try {
            // Initialize empty objects to store counts
            const today = moment().format('YYYY-MM-DD');
            const filesStats = await FileRemarks.findAll({
                where: {
                    submittedBy: userId,
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                },
                include: [{
                    model: Files,
                    as: "file",
                }],
                attributes: [
                    'CommentStatus',
                    'file.id',
                    [db.sequelize.fn('COUNT', db.sequelize.col('fileRemarks.id')), 'count']
                ],
                group: ['CommentStatus', 'file.id']
            });

            // Initialize arrays to store file ids for each category
            let submitForApprovalData = [];
            let approvedFilesData = [];
            let nfaFilesData = [];
            let pendingFilesData = [];
            let discussedFilesData = [];

            filesStats.forEach(stat => {
                const status = stat.CommentStatus;
                const file = stat.get('file');

                switch (status) {
                    case 'Submit For Approval':
                        submitForApprovalData.push(file);
                        break;
                    case 'Approved':
                        approvedFilesData.push(file);
                        break;
                    case 'Under Discussion':
                        discussedFilesData.push(file);
                        break;
                    case 'NFA':
                        nfaFilesData.push(file);
                        break;
                    case 'Pend':
                        pendingFilesData.push(file);
                        break;
                    default:
                        break;
                }
            });

            // Combine the counts and arrays into a stats object
            const stats = {
                submitForApproval: submitForApprovalData.length,
                approvedFiles: approvedFilesData.length,
                discussedFiles: discussedFilesData.length,
                pendingFiles: pendingFilesData.length,
                nfaFiles: nfaFilesData.length,
                totalFiles: submitForApprovalData.length + approvedFilesData.length + discussedFilesData.length + pendingFilesData.length + nfaFilesData.length,
                submitForApprovalData,
                nfaFilesData,
                discussedFilesData,
                approvedFilesData,
                pendingFilesData
            };


            // const totalFiles = approvedFiles + disapprovedFiles + discussedFiles
            //   const totalFiles = approvedFiles + discussedFiles + nfaFiles + pendingFiles


            // Combine approvedFiles, disapprovedFiles and discussedFiles  into stats object
            // const stats = { approvedFiles, discussedFiles, pendingFiles, nfaFiles, totalFiles };

            return stats;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Files Approval Stats");
        }
    },

    // Files Pending For Assigned To User
    getFilesPendingCount: async (userId) => {
        try {

            const fileNotifs = await FilesNotifications.findAndCountAll({
                where: { fkUserId: userId },
                include: [
                    {
                        model: Cases,
                        as: 'case',
                        required: true,
                        attributes: ['id', 'fkFileId', 'createdBy', 'createdAt', 'updatedAt'],
                        include: [
                            {
                                model: Files,
                                as: 'files',
                            },
                        ]
                    }]
            })

            const frNotifs = await FilesNotifications.findAndCountAll({
                where: { fkUserId: userId },
                include: [{
                    model: FreshReceipts,
                    as: 'freshReceipt'
                }]
            })

            const filteredFileNotifs = fileNotifs.rows.filter(notif => notif.fkFileId || notif.fkCaseId);
            const formattedPendingFiles = filteredFileNotifs.map(fileRemark => ({
                notificationId: fileRemark.id,
                fileId: fileRemark.fkFileId,
                caseId: fileRemark.fkCaseId,
                message: `You have received a case:${fileRemark.fkCaseId}`,
                date: fileRemark.createdAt

            }));

            const filteredFrNotifs = frNotifs.rows.filter(notif => notif.fkFreshReceiptId);
            const formattedPendingFRs = filteredFrNotifs.map(frRemark => ({
                notificationId: frRemark.id,
                frId: frRemark.fkFreshReceiptId,
                message: `You have received a FR:${frRemark.fkFreshReceiptId}`,
                date: frRemark.createdAt

            }));

            // Sort the arrays by date in descending order
            formattedPendingFiles.sort((a, b) => new Date(b.date) - new Date(a.date));
            formattedPendingFRs.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            return {
                filesCount: formattedPendingFiles.length, 
                files: formattedPendingFiles,
                frsCount: formattedPendingFRs.length, 
                frs: formattedPendingFRs,
                totalCount: formattedPendingFiles.length + formattedPendingFRs.length 
            };


        } catch (error) {
            throw new Error("Error Retrieving Files Pending Count and Details");
        }
    },

    // Make Notification Count Zero
    makeNotificationZero: async (notificationId, userId) => {
        try {
           const notification = await FilesNotifications.destroy({
                where: {
                    id: notificationId,
                    fkUserId: userId
                }
            })
            return notification

        } catch (error) {
            console.log(error)
        }
    }




}

module.exports = filesDashboardService