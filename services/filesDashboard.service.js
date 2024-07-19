const db = require("../models");
const Files = db.newFiles
const FilesRegisters = db.fileRegisters
const FileRemarks = db.fileRemarks
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

    // Stats For Sent And Received
    getFileSentAndReceivedStats: async (userId) => {
        try {

            const today = moment().format('YYYY-MM-DD');
            // Count sent files where sumittedBy is the userId
            const sentFilesCount = await FileRemarks.count({
                where: {
                    submittedBy: userId,
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                }
            });
            // Count received files where assignedTo is the userId
            const receivedFilesCount = await FileRemarks.count({
                where: {
                    assignedTo: userId,
                    createdAt: {
                        [Op.between]: [`${today} 00:00:00`, `${today} 23:59:59`]
                    }
                }
            });

            // Calculate the total files by summing sent and received files counts
            const totalFiles = sentFilesCount + receivedFilesCount;

            // Create the stats object
            const stats = { sentFiles: sentFilesCount, receivedFiles: receivedFilesCount, totalFiles };

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
            let approvedFilesData = [];
            let nfaFilesData = [];
            let pendingFilesData = [];
            let discussedFilesData = [];

            filesStats.forEach(stat => {
                const status = stat.CommentStatus;
                const file = stat.get('file');

                switch (status) {
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
                approvedFiles: approvedFilesData.length,
                discussedFiles: discussedFilesData.length,
                pendingFiles: pendingFilesData.length,
                nfaFiles: nfaFilesData.length,
                totalFiles: approvedFilesData.length + discussedFilesData.length + pendingFilesData.length + nfaFilesData.length,
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
            // Fetch IDs of files/cases that the user has reassigned (submittedBy)
            const reassignedIds = await FileRemarks.findAll({
                attributes: ['fkFileId'],
                where: {
                    submittedBy: userId,
                    assignedTo: { [db.Sequelize.Op.ne]: userId }
                },
                group: ['fkFileId']
            }).map(entry => entry.fkFileId);

            // Fetch details of files/cases assigned to the user but not reassigned by them
            const pendingFilesDetails = await FileRemarks.findAll({
                where: {
                    assignedTo: userId,
                    fkFileId: { [db.Sequelize.Op.notIn]: reassignedIds }
                },
                include: [{
                    model: Files,
                    as: 'file'
                }],
                order: [['createdAt', 'DESC']]
            });

            // Consolidate entries with the same fileId and caseId, keeping only the latest
            const uniqueFileCaseMap = new Map();
            pendingFilesDetails.forEach(fileRemark => {
                const key = `${fileRemark.fkFileId}-${fileRemark.fkCaseId}`;
                if (!uniqueFileCaseMap.has(key)) {
                    uniqueFileCaseMap.set(key, fileRemark);
                }
            });

            const formattedPendingFiles = Array.from(uniqueFileCaseMap.values()).map(fileRemark => ({
                fileId: fileRemark.fkFileId,
                caseId: fileRemark.fkCaseId,
                message: `You have received a case:${fileRemark.fkCaseId}`,
                date: fileRemark.createdAt
                // fileDetails: fileRemark.file
            }));

            return {
                count: uniqueFileCaseMap.size,
                files: formattedPendingFiles
            };
        } catch (error) {
            console.error('Error Retrieving Files Pending Count and Details:', error.message);
            throw new Error("Error Retrieving Files Pending Count and Details");
        }
    },





}

module.exports = filesDashboardService