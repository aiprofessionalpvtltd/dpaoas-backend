const db = require("../models");
const File = db.files;
const newFiles = db.newFiles
const fileRemarks = db.fileRemarks;
const filedairies = db.filedairies;
const employees = db.employees;
const designations = db.designations;
const FileRegisters = db.fileRegisters
const mainHeadingFiles = db.mainHeadingFiles
const Branches = db.branches
const departments = db.departments;
const fs = require('fs-extra');
const Op = db.Sequelize.Op;
const logger = require('../common/winston');
const users = db.users;
const fileAttachments = db.fileAttachments;

const FileService = {
    // Create A New File
    createFile: async (req, fileRegisterId) => {
        try {
            // Check if fkMainHeadingId is already assigned to anoth
            // Check if serialNumber is already assigned to another file
            const existingSerialNumber = await newFiles.findOne({
                where: { serialNumber: req.serialNumber }
            });
    
            if (existingSerialNumber) {
                throw new Error('Serial Number already exists.');
            }
    
            // Check if fileNumber is already assigned to another file
            const existingFileNumber = await newFiles.findOne({
                where: { fileNumber: req.fileNumber }
            });
    
            if (existingFileNumber) {
                throw new Error('File Number already exists.');
            }
    
            // Create the File
            const fileCreate = await newFiles.create({
                fkFileRegisterId: fileRegisterId,
                fkBranchId: req.fkBranchId,
                fkMainHeadingId: req.fkMainHeadingId,
                year: req.year,
                serialNumber: req.serialNumber,
                fileNumber: req.fileNumber,
                fileSubject: req.fileSubject,
                fileCategory: req.fileCategory,
                fileType: req.fileType,
                fileClassification: req.fileClassification,
                fileMovement: req.fileMovement,
            });
            
            const fileId = fileCreate.id;
            await FileRegisters.update(
                { fkFilesId: db.sequelize.fn('array_append', db.sequelize.col('fkFilesId'), fileId) },
                { where: { id: fileRegisterId } }
            );
    
            return fileCreate;
        } catch (error) {
            throw { message: error.message || "Error Creating File" };
        }
    },
        
    // Retrieve Files On the Basis of File Register Id
    findFilesByRegisterId: async (fileRegisterId, mainHeadingNumber) => {
        try {
            // const offset = currentPage * pageSize;
            // const limit = pageSize;
            const { count, rows } = await newFiles.findAndCountAll({
                where: {
                    fkFileRegisterId: fileRegisterId,
                },
                include: [
                    {
                        model: FileRegisters,
                        as: 'fileRegister',
                        attributes: ['id', 'registerNumber', 'year', 'registerSubject']
                    },
                    {
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    },
                    {
                        model: mainHeadingFiles,
                        as: 'mainHeading',
                        where: { mainHeadingNumber: mainHeadingNumber },
                        attributes: ['id', 'mainHeading', 'mainHeadingNumber']
                    },

                ],
                // offset,
                // limit,
                distinct: true,
                order: [
                    ['id', 'ASC'],
                ],
            });
            // const totalPages = Math.ceil(count / pageSize);
            return { count, files: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Headings By Branch ");
        }
    },

    // Retrieve Formatted Years
    retrieveFormattedYears: async () => {
        try {
            const startYear = 2020; // Fixed start year
            const endYear = 2025; // End year, for the range ending at "2025-26"
    
            const formattedYears = [];
            let id = 1;
    
            for (let year = startYear; year <= endYear; year++) {
                formattedYears.push({
                    id: id++,
                    year: `${year}`
                });
                // Avoid adding the next year format for the final year in the loop
                if (year < endYear) {
                    formattedYears.push({
                        id: id++,
                        year: `${year}-${String(year + 1).slice(-2)}`
                    });
                }
            }
            return formattedYears;
        } catch (error) {
            throw new Error("Error retrieving formatted years: " + error.message);
        }
    },    
    

    createGallery: async (fkFileId, files) => {
        const filesPayload = files?.map((file) => {
            return {
                fkFileId,
                title: file.filename,
                url: `${file.destination.replace('./public/', '/assets/')}/${file.filename
                    }`,
            }
        })
        if (files.length > 0) {
            const galleryPayload = files?.map((file) => {
                const path = `${file.destination.replace('./public/', '/assets/')}/${file.filename
                    }`
                return [fkFileId, file.filename, path]
            })
            // Bulk insert into Gallery model
            await fileAttachments.bulkCreate(filesPayload);

            return filesPayload;
        }
    },

    // Get File by ID
    findSingleFile: async (id) => {
        try {
            const result = await File.findOne({
                raw: false,
                where: {
                    id: id
                },
                include: [
                    {
                        model: fileRemarks,
                        as: 'fileRemarks',
                        // attributes: ['comment', 'commentBy', 'CommentStatus'],
                        include: [{
                            model: users,
                            as: 'users',
                            attributes: ['id',],
                            include: [{
                                model: employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName', 'fkDepartmentId', 'fkDesignationId', 'id'],
                                include: [{
                                    model: designations,  // Assuming you have a 'designations' model
                                    as: 'employeeDesignation',
                                    attributes: ['designationName', 'id']
                                }],

                            }],

                        }],
                    }
                    ,
                    {
                        model: fileAttachments,
                        as: 'fileAttachments',
                        // attributes: ['attachment', 'id']
                    },
                    {
                        model: filedairies,
                        as: 'filedairies',
                        include: [{
                            model: users,
                            as: 'users',
                            attributes: ['id',],
                            include: [{
                                model: employees,
                                as: 'employee',
                                attributes: ['firstName', 'lastName', 'fkDepartmentId', 'fkDesignationId', 'id'],
                                include: [{
                                    model: departments,  // Assuming you have a 'designations' model
                                    as: 'departments',
                                    attributes: ['departmentName', 'id']
                                }],

                            }],

                        }],
                        distinct: true
                    },
                ],
            });

            return result
        } catch (error) {
            console.error('Error Fetching File request:', error.message);
        }
    },

    // Updates File
    updateFile: async (id, payload) => {
        try {

            let { fileNumber, submittedBy, receivedOn, fileType, fkBranchId, fkdepartmentId, fkMinistryId, fileSubject,
                notingDescription, correspondingDescription, year, priority, fileStatus, assignedTo, comment, commentBy, CommentStatus } = payload;
            const result = await File.findOne({
                raw: false,
                where: {
                    id: id
                }
            });

            const UpdateFile = await File.update(
                {
                    fileNumber,
                    submittedBy,
                    assignedTo,
                    receivedOn,
                    fileType,
                    fkBranchId,
                    fkdepartmentId,
                    fkMinistryId,
                    fileSubject,
                    notingDescription,
                    correspondingDescription,
                    year,
                    priority,
                    fileStatus
                },
                {
                    where: { id: id }
                }
            );
            const remarks = await fileRemarks.create({
                comment,
                commentBy: commentBy,
                fkFileId: id,
                CommentStatus: CommentStatus,
            });

            const filedairyRecord = await filedairies.findOne({
                raw: false,
                where: {
                    fkUserId: assignedTo || null,
                },
                order: [['id', 'DESC']],
                limit: 1,
            });
            let fileInDairyNumber;
            if (filedairyRecord) {
                fileInDairyNumber = filedairyRecord.fileInDairyNumber + 1
            } else {
                fileInDairyNumber = 1
            }

            const fileDairy = await filedairies.create({
                fkFileId: id,
                fkBranchId: fkBranchId,
                fkDepartmentId: fkdepartmentId,
                fkUserId: assignedTo,
                fileInDairyNumber: fileInDairyNumber,
            });
            return fileDairy;
        } catch (error) {
            throw { message: error.message || "Error Updating File" };
        }
    },

    // Deletes/Suspend File
    suspendFile: async (req) => {
        try {
            const fileId = req.params.id;
            const fileData = await File.findByPk(fileId);
            if (!fileData) {
                throw ({ message: "File Not Found!" });
            }
            const updatedData = {
                fileStatus: "Closed"
            }

            await File.update(updatedData, { where: { id: fileId } });

            // Fetch the updated Branch after the update
            const updatedFile = await File.findByPk(fileId, { raw: true });

            return updatedFile;


        } catch (error) {
            throw { message: error.message || "Error Suspending File" };
        }
    }
}

module.exports = FileService    
