const db = require("../models");
const Divisions = db.divisions;
const Branches = db.branches
const BranchHierarchy = db.branchHierarchies;
const Ministries = db.ministries
const FreshReceipts = db.freshReceipts
const FileDiaries = db.fileDiaries
const FreshReceiptAttachments = db.freshReceiptsAttachments
const CaseAttachments = db.caseAttachments
const SectionCases = db.sectionsCases
const Cases = db.cases
const Files = db.newFiles
const FileRemarks = db.fileRemarks
const FileUserDiares = db.fileUserDiaries
const Users = db.users
const Departments = db.departments
const Designations = db.designations
const FileNotifications = db.filesNotifications
const Employees = db.employees
const FileSignatures = db.fileSignatures
const CaseNotes = db.caseNotes
const NoteParagraphs = db.noteParagraphs
const Correspondences = db.correspondences
const CorrespondenceAttachments = db.correspondenceAttachments
const Op = db.Sequelize.Op;
const logger = require('../common/winston');
const { error } = require("../validation/userValidation");

const moment = require('moment-timezone');

const casesService = {
    // Create Case For The File
    // createCase: async (data, files, fileId, createdBy, freshReceiptId) => {
    //     try {
    //         const caseModel = await Cases.create({
    //             fkFileId: fileId,
    //             createdBy: createdBy,
    //             fkFreshReceiptId: freshReceiptId ? freshReceiptId : null,
    //         })

    //         const createdCases = [];
    //         const cases = data['cases'];

    //         // Find the highest caseId for the current fileId
    //         await SectionCases.findOne({
    //             where: { fkCaseId: caseModel.id },
    //             order: [['fkCaseId', 'DESC']],
    //             attributes: ['fkCaseId'],
    //         });


    //         // Iterate over each case in the `cases` array
    //         for (const caseItem of cases) {
    //             const caseSections = Object.keys(caseItem);

    //             for (const sectionType of caseSections) {
    //                 const sectionData = caseItem[sectionType];
    //                 const { description } = sectionData;

    //                 const createdCase = await SectionCases.create({
    //                     fkCaseId: caseModel.id,
    //                     sectionType: sectionType,
    //                     description: description,
    //                 });

    //                 createdCases.push(createdCase);

    //                 // Process files for the current section
    //                 const sectionFiles = files.filter(file =>
    //                     file.fieldname.startsWith(`cases[0][${sectionType}][sections]`)
    //                 );

    //                 if (sectionFiles.length > 0) {
    //                     const attachments = sectionFiles.map(file => {
    //                         const path = file.destination.replace('./public/', '/public/');
    //                         return {
    //                             fileName: `${path}/${file.filename}`,
    //                             fkSectionId: createdCase.id,
    //                         };
    //                     });
    //                     await CaseAttachments.bulkCreate(attachments);
    //                 }
    //             }
    //         }

    //         return createdCases;
    //     } catch (error) {
    //         throw new Error(error.message || "Error Creating Case!");
    //     }
    // },

    // Create Case For the File
    createCase: async (data, fileId, createdBy, freshReceiptId) => {
        try {
            const caseModel = await Cases.create({
                fkFileId: fileId,
                createdBy: createdBy,
                fkFreshReceiptId: freshReceiptId ? freshReceiptId : null,
            });
    
            const caseId = caseModel.id;
            const caseNotes = await CaseNotes.create({
                fkBranchId: data.fkBranchId,
                fkFileId: fileId,
                fkCaseId: caseId,
                createdBy: createdBy,
                notingSubject: data.notingSubject
            });
    
            let paragraphArray = data.paragraphArray;
            if (typeof (paragraphArray) === 'string') {
                try {
                    paragraphArray = JSON.parse(paragraphArray);
                } catch (error) {
                    throw new Error("Invalid format for paragraphArray");
                }
            }
    
            let allCorrespondencesIds = new Array(paragraphArray.length).fill(null);
            let allFreshReceiptIds = new Array(paragraphArray.length).fill(null);
    
            if (Array.isArray(paragraphArray) && paragraphArray.length > 0) {
                await Promise.all(paragraphArray.map(async (para, index) => {
                    let correspondencesIds = [];
                    let freshReceiptIds = [];
    
                    para.references.forEach(ref => {
                        if (ref.attachments && Array.isArray(ref.attachments)) {
                            ref.attachments.forEach(att => {
                                if (att.name) {
                                    correspondencesIds.push(ref.id);
                                } else if (att.filename) {
                                    freshReceiptIds.push(ref.id);
                                }
                            });
                        }
                    });
    
                    // Store the first ID found for each type, if any
                    if (correspondencesIds.length > 0) {
                        allCorrespondencesIds[index] = correspondencesIds[0];
                    }
                    if (freshReceiptIds.length > 0) {
                        allFreshReceiptIds[index] = freshReceiptIds[0];
                    }
    
                    await NoteParagraphs.create({
                        fkCaseNoteId: caseNotes.id,
                        paragraphTitle: para.title,
                        paragraph: para.description,
                        flags: para.references.map(ref => ref.flag).join(',')
                    });
                }));
    
                await CaseNotes.update(
                    {
                        fkCorrespondenceIds: allCorrespondencesIds,
                        fkFreshReciptIds: allFreshReceiptIds
                    },
                    { where: { id: caseNotes.id } }
                );
            }
    
            return caseNotes;
        } catch (error) {
            console.error("Error Creating Case", error);
            throw new Error(error.message || "Error Creating Case");
        }
    },

    // Get Cases By File Id
    getCasesByFileId: async (fileId, userId, currentPage, pageSize) => {
        try {
            const allRelevantSections = await CaseNotes.findAll({
                include: [
                    {
                        model: Cases,
                        as: 'cases',
                        required: true,
                        attributes: ['id', 'fkFileId', 'isEditable', 'createdBy', 'createdAt', 'updatedAt'],
...(fileId ? { where: { fkFileId: fileId } } : {}),
                        include: [
                            {
                                model: Files,
                                as: 'files',
                                                            },
                            {
                                model: FreshReceipts,
                                as: 'freshReceipts',
                                include: [
                                    {
                                        model: FreshReceiptAttachments,
                                        as: 'freshReceiptsAttachments',
                                        attributes: ['id', 'filename']
                                    }
                                ]
                            },
                            {
                                model: Users,
                                as: 'createdByUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employees,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [{
                                            model: Designations,
                                            as: 'designations',
                                            attributes: ['id', 'designationName'],

                                        }]
                                    },

                                ],
                            },
                            {
                                model: FileRemarks,
                                as: 'casesRemarks',
                                separate: true,
                                attributes: ['id', 'assignedTo', 'submittedBy', 'fkFileId', 'fkCaseId', 'comment', 'CommentStatus', 'createdAt', 'updatedAt'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'submittedUser',
                                        attributes: ['id'],
                                        include: [{
                                            model: Employees,
                                            as: 'employee',
                                            attributes: ['id', 'firstName', 'lastName'],
                                            include: [{
                                                model: Designations,
                                                as: 'designations',
                                                attributes: ['id', 'designationName']
                                            }]
                                        }],
                                    },
                                    {
                                        model: Users,
                                        as: 'assignedUser',
                                        attributes: ['id'],
                                        include: [{
                                            model: Employees,
                                            as: 'employee',
                                            attributes: ['id', 'firstName', 'lastName'],
                                            include: [{
                                                model: Designations,
                                                as: 'designations',
                                                attributes: ['id', 'designationName']
                                            }]
                                        }]
                                    }
                                ],
                                order: [['createdAt', 'DESC']],
                            },
                        ],
                    },
                ],
                attributes: ['id', 'fkCaseId', 'notingSubject', 'fkCorrespondenceIds', 'createdAt'],
                order: [['id', 'DESC']],
                            });
    

            const casesByCaseId = {};
            allRelevantSections.forEach(section => {
                const caseData = section.cases;
                const remarks = caseData.casesRemarks || [];
                const createdBy = parseInt(caseData.createdBy);
    
                // Determine visibility and isEditable
                let isVisible = false;
// let isEditable = true;
    
// Initial visibility is only for the creator
                if (parseInt(userId) === createdBy) {
                    isVisible = true;
// isEditable = remarks.length === 0;  // Creator can edit if no remarks
                }
    
// Check remarks for further visibility and editability
                if (remarks.length > 0) {
                    const latestRemark = remarks.reduce((latest, remark) => {
                        return (latest.createdAt > remark.createdAt) ? latest : remark;
                    }, { createdAt: new Date(0), assignedTo: null });
    
// If there is a latest remark, check if the user is the one it's assigned to
                    if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
                        isVisible = true;  // The assigned user can also see the case
                        //   isEditable = true;  // The assigned user can edit the case
                    } else {
// Ensure the creator retains visibility even when not the latest assigned
                        isVisible = isVisible || parseInt(createdBy) === parseInt(userId);
// isEditable = false;  // Creator cannot edit once assigned to someone else
                    }
                }
    


                // Ensuring each case is only added once with the full data structure
                if (isVisible) {
                    if (!casesByCaseId[caseData.id]) {
                        casesByCaseId[caseData.id] = {
                            id: caseData.id,
                            fkCaseId: section.fkCaseId,
                            createdAt: caseData.createdAt,
                            createdBy: caseData.createdBy,
//  isEditable: isEditable,
                            fileData: section.cases.files,
                            freshReceiptData: section.cases.freshReceipts,
                            fileRemarksData: section.cases.casesRemarks,
                        };
                    }

                    // Adding section specific data
                    // casesByCaseId[caseData.id][section.sectionType] = {
                    //     description: section.description,
                    //     caseAttachments: section.caseAttachments
                    // };
                }
            });
    
            const aggregatedCases = Object.values(casesByCaseId);
            const paginatedCases = aggregatedCases.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
            const totalPages = Math.ceil(aggregatedCases.length / pageSize);
    
            return {
                cases: paginatedCases,
                count: aggregatedCases.length,
                totalPages
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Cases");
        }
    },

    //Get Case History On The Basis of Created User
    getCasesHistory: async (fileId, userId, branchId, currentPage, pageSize) => {
        try {
            const allSections = await SectionCases.findAll({
                include: [
                    {
                        model: CaseAttachments,
                        as: 'caseAttachments',
                        attributes: ['id', 'fileName']
                    },
                    {
                        model: Cases,
                        as: 'cases',
                        where: { fkFileId: fileId },
                        include: [
                            {
                                model: Files,
                                as: "files",
                                where: { fkBranchId: branchId },
                            },
                            {
                                model: FreshReceipts,
                                as: 'freshReceipts',
                                include: [
                                    {
                                        model: FreshReceiptAttachments,
                                        as: 'freshReceiptsAttachments',
                                        attributes: ['id', 'filename']
                                    }
                                ]
                            },
                            {
                                model: Users,
                                as: 'createdByUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employees,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [{
                                            model: Designations,
                                            as: 'designations',
                                            attributes: ['id', 'designationName']
                                        }]
                                    }
                                ]
                            },
                            {
                                model: FileRemarks,
                                as: 'casesRemarks',
                                separate: true,
                                include: [
                                    {
                                        model: Users,
                                        as: 'submittedUser',
                                        attributes: ['id'],
                                        include: [
                                            {
                                                model: Employees,
                                                as: 'employee',
                                                attributes: ['id', 'firstName', 'lastName'],
                                                include: [{
                                                    model: Designations,
                                                    as: 'designations',
                                                    attributes: ['id', 'designationName']
                                                }]
                                            }
                                        ]
                                    },
                                    {
                                        model: Users,
                                        as: 'assignedUser',
                                        attributes: ['id'],
                                        include: [
                                            {
                                                model: Employees,
                                                as: 'employee',
                                                attributes: ['id', 'firstName', 'lastName'],
                                                include: [{
                                                    model: Designations,
                                                    as: 'designations',
                                                    attributes: ['id', 'designationName']
                                                }]
                                            }
                                        ]
                                    },
                                ]
                            }
                        ]
                    }
                ],
                attributes: ['id', 'fkCaseId', 'sectionType', 'description'],
                order: [['id', 'DESC']],
            });

            const casesByCaseId = {};
            allSections.forEach(section => {
                const { fkCaseId, sectionType, description, caseAttachments } = section;
                const fileData = section.cases.files || {};
                const freshReceiptData = section.cases.freshReceipts || {}
                const fileRemarksData = section.cases.casesRemarks || {};
                const caseDate = section.cases.createdAt || 0
                const createdBy = section.cases.createdBy || 0

                if (!casesByCaseId[fkCaseId]) {
                    casesByCaseId[fkCaseId] = { fkCaseId, caseDate, createdBy, fileData, freshReceiptData, fileRemarksData };
                }
                casesByCaseId[fkCaseId][sectionType] = { description, caseAttachments };
            });

            const aggregatedCases = Object.values(casesByCaseId);
            const paginatedCases = aggregatedCases.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
            const totalPages = Math.ceil(aggregatedCases.length / pageSize);


            return {
                cases: paginatedCases,
                count: aggregatedCases.length,
                totalPages,
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Cases");
        }
    },

    // Get Approved Case Hitory
    getApprovedCasesHistory: async (fileId, userId, branchId, currentPage, pageSize) => {
        try {

            const casesWhereCondition = {};
            const filesWhereCondition = {};

            // Add fileId condition to Cases where condition if fileId is provided
            if (fileId) {
                casesWhereCondition.fkFileId = fileId;
            }

            // Add branchId condition to Files where condition if branchId is provided
            if (branchId) {
                filesWhereCondition.fkBranchId = branchId;
            }


            const allSections = await SectionCases.findAll({
                include: [
                    {
                        model: CaseAttachments,
                        as: 'caseAttachments',
                        attributes: ['id', 'fileName']
                    },
                    {
                        model: Cases,
                        as: 'cases',
                        // ...(fileId ? { where: { fkFileId: fileId } } : {}),
                        where: casesWhereCondition, // Apply Cases where condition
                        include: [
                            {
                                model: Files,
                                as: 'files',
                                // ...(branchId ? { where: { fkBranchId: branchId } } : {}),
                                where: filesWhereCondition,
                            },
                            {
                                model: FreshReceipts,
                                as: 'freshReceipts',
                                include: [
                                    {
                                        model: FreshReceiptAttachments,
                                        as: 'freshReceiptsAttachments',
                                        attributes: ['id', 'filename']
                                    }
                                ]
                            },
                            {
                                model: Users,
                                as: 'createdByUser',
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Employees,
                                        as: 'employee',
                                        attributes: ['id', 'firstName', 'lastName'],
                                        include: [{
                                            model: Designations,
                                            as: 'designations',
                                            attributes: ['id', 'designationName']
                                        }]
                                    }
                                ]
                            },
                            {
                                model: FileRemarks,
                                as: 'casesRemarks',
                                attributes: ['id', 'comment', 'CommentStatus', 'submittedBy', 'assignedTo', 'createdAt'],
                                where: { CommentStatus: "Approved" },
                                include: [
                                    {
                                        model: Users,
                                        as: 'submittedUser',
                                        attributes: ['id'],
                                        include: [
                                            {
                                                model: Employees,
                                                as: 'employee',
                                                attributes: ['id', 'firstName', 'lastName'],
                                                include: [{
                                                    model: Designations,
                                                    as: 'designations',
                                                    attributes: ['id', 'designationName']
                                                }]
                                            }
                                        ]
                                    },
                                    {
                                        model: Users,
                                        as: 'assignedUser',
                                        attributes: ['id'],
                                        include: [
                                            {
                                                model: Employees,
                                                as: 'employee',
                                                attributes: ['id', 'firstName', 'lastName'],
                                                include: [{
                                                    model: Designations,
                                                    as: 'designations',
                                                    attributes: ['id', 'designationName']
                                                }]
                                            }
                                        ]
                                    },
                                ]
                            },
                        ]
                    }
                ],
                attributes: ['id', 'fkCaseId', 'sectionType', 'description'],
                order: [['id', 'DESC']],
            });

            // Aggregate sections by caseId
            const casesByCaseId = {};
            allSections.forEach(section => {
                const { fkCaseId, sectionType, description, caseAttachments } = section;
                const cases = section.cases || {};

                const fileData = cases.files || {};
                const freshReceiptData = cases.freshReceipts || {};
                let fileRemarksData = cases.casesRemarks || []
                if (cases.casesRemarks && cases.casesRemarks.length > 0) {
                    const sortedRemarks = cases.casesRemarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    fileRemarksData = sortedRemarks.find(remark => remark.CommentStatus === "Approved") || [];
                }
                const caseDate = cases.createdAt || 0;
                const createdBy = cases.createdBy || 0;

                if (!casesByCaseId[fkCaseId]) {
                    casesByCaseId[fkCaseId] = { fkCaseId, caseDate, createdBy, fileData, freshReceiptData, fileRemarksData };
                }
                casesByCaseId[fkCaseId][sectionType] = { description, caseAttachments };
            });

            const aggregatedCases = Object.values(casesByCaseId);
            const paginatedCases = aggregatedCases.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
            const totalPages = Math.ceil(aggregatedCases.length / pageSize);


            return {
                cases: paginatedCases,
                count: aggregatedCases.length,
                totalPages,
            };
        } catch (error) {
            console.log(error)
            throw new Error(error.message || "Error Fetching Cases");
        }
    },

    getSingleCase: async (fileId, caseId) => {
        try {

            const caseFile = await Cases.findAll({
                where: { id: caseId, fkFileId: fileId },
                attributes: ['id', 'isEditable']
            })
            const caseIds = caseFile.map(caseId => caseId.id)
            const result = await SectionCases.findAll({
                raw: false,
                where: {
                    fkCaseId: caseIds,
                },
                include: [{
                    model: CaseAttachments,
                    as: 'caseAttachments',
                    attributes: ['id', 'fileName']
                }],
                attributes: ['id', 'fkCaseId', 'sectionType', 'description'],
            });

            const casesByCaseId = {};
            result.forEach(section => {
                const { fkCaseId, sectionType, description, caseAttachments } = section;
                if (!casesByCaseId[fkCaseId]) {
                    casesByCaseId[fkCaseId] = { fkCaseId };
                }
                const caseItem = caseFile.find(item => item.id === fkCaseId);
                const isEditable = caseItem ? caseItem.isEditable : null;
                casesByCaseId[fkCaseId][sectionType] = { description, caseAttachments, isEditable };
            });
            const cases = Object.values(casesByCaseId);

            return cases
        } catch (error) {
            console.error('Error Fetching Case:', error.message);
        }
    },

    // Update Case For The File
    // updateCase: async (data, files, fileId, caseId) => {
    //     try {
    //         const updatedCases = [];
    //         const cases = data['cases'];

    //         for (const caseItem of cases) {
    //             for (const sectionType in caseItem) {
    //                 const sectionData = caseItem[sectionType];
    //                 const { description } = sectionData;

    //                 const caseModel = await Cases.findOne({
    //                     where: {
    //                         id: caseId,
    //                         fkFileId: fileId
    //                     }
    //                 });

    //                 await Cases.update(
    //                     { isEditable: data.isEditable },
    //                     {
    //                         where: {
    //                             id: caseId,
    //                             fkFileId: fileId
    //                         }
    //                     }
    //                 );

    //                 // Fetch or create the case section
    //                 let existingCaseSection = await SectionCases.findOrCreate({
    //                     where: {
    //                         fkCaseId: caseModel.id,
    //                         sectionType: sectionType,
    //                     },
    //                     defaults: { description: description }
    //                 });

    //                 const [section, wasCreated] = existingCaseSection;
    //                 if (!wasCreated && section.description !== description) {
    //                     section.description = description;
    //                     await section.save();
    //                 }
    //                 updatedCases.push(section);

    //                 // Retrieve existing attachments for this section
    //                 const existingAttachments = await CaseAttachments.findAll({
    //                     where: { fkSectionId: section.id }
    //                 });

    //                 const existingAttachmentIds = existingAttachments.map(a => a.id);

    //                 // Filter files for the current sectionType
    //                 const filteredFiles = files.filter(file => {
    //                     return file.fieldname.includes(`[${sectionType}]`);
    //                 });


    //                 for (const file of filteredFiles) {
    //                     const path = file.destination.replace('./public/', '/public/');
    //                     const filePath = `${path}/${file.filename}`;

    //                     if (file.id && existingAttachmentIds.includes(file.id)) {
    //                         continue;
    //                     }

    //                     // Check if a new file needs to be added or an existing file needs to be updated
    //                     const existingAttachment = existingAttachments.find(a => a.fileName === filePath);

    //                     if (!existingAttachment) {
    //                         await CaseAttachments.create({
    //                             fileName: filePath,
    //                             fkSectionId: section.id
    //                         });
    //                     } else if (existingAttachment && file.id) {
    //                         existingAttachment.fileName = filePath;
    //                         await existingAttachment.save();
    //                     }
    //                 }
    //             }
    //         }

    //         return updatedCases;
    //     } catch (error) {
    //         throw { message: error.message || "Error Updating Case!" };
    //     }
    // },

    //Update Case For The File
    updateCase: async (data, caseNotesId) => {
        try {
            // Update existing case notes
            await CaseNotes.update({
                notingSubject: data.notingSubject
            }, {
                where: { id: caseNotesId }
            });

            let paragraphArray = data.paragraphArray;
            if (typeof (paragraphArray) === 'string') {
                try {
                    paragraphArray = JSON.parse(paragraphArray);
                } catch (error) {
                    throw new Error("Invalid format for paragraphArray");
                }
            }

            // Destroy all existing paragraphs only once
            await NoteParagraphs.destroy({ where: { fkCaseNoteId: caseNotesId } });

            let allCorrespondencesIds = [];
            if (Array.isArray(paragraphArray) && paragraphArray.length > 0) {
                createdParas = await Promise.all(data.paragraphArray.map(async (para, index) => {
                    const correspondencesIds = para.references.map(ref => ref.id);
                    allCorrespondencesIds = allCorrespondencesIds.concat(correspondencesIds);
                    const updateData = {
                        fkCorrespondenceIds: allCorrespondencesIds
                    }
                    //   await NoteParagraphs.destroy({ where: { fkCaseNoteId: caseNotesId } })
                    await CaseNotes.update(updateData, { where: { id: caseNotesId } })
                    return await NoteParagraphs.create({
                        fkCaseNoteId: caseNotesId,
                        paragraphTitle: para.title,
                        paragraph: para.description,
                        flags: para.references.map(flag => flag.flag).join(',')
                    });

                }));

            }

            return await CaseNotes.findByPk(caseNotesId);
        } catch (error) {
            console.log(error);
            throw new Error({ message: error.message });
        }
    },


    // Assign Case
    assignCase: async (fileId, caseId, files, req) => {
        try {
            const sharedDesignations = ["Superintendent", "IT Assistant", "Sub Assistant", "Junior Assistant"];

            // Retrieve the employee details for the user who is submitting the case
            const employee = await Employees.findOne({
                where: { fkUserId: req.submittedBy },
                attributes: ['id', 'fkBranchId', 'fkDesignationId', 'userType'],
                include: [
                    {
                        model: Designations,
                        as: 'designations',
                        attributes: ['id', 'designationName']
                    }
                ]
            });

            const { fkBranchId, userType, designations } = employee;
            //  const sharesDiaryNumber = sharedDesignations.includes(designations.designationName);


            // const sharesDiaryNumber = 
            let newDiaryNumber;

            if (userType === "Section User") {
                const usersWithSharedDesignations = await Employees.findAll({
                    where: {
                        fkBranchId: fkBranchId,
                        userType: "Section User"
                    },
                    attributes: ['fkUserId'],
                    include: [
                        {
                            model: Designations,
                            as: 'designations',
                            attributes: ['id', 'designationName']
                        }
                    ]
                });
                const userIds = usersWithSharedDesignations.map(user => user.fkUserId);
                let maxDiaryNumber = await FileUserDiares.max('diaryNumber', {
                    where: {
                        fkFileId: fileId,
                        fkCaseId: caseId,
                        fkSubmittedByUserId: {
                            [Op.in]: userIds
                        }
                    }
                });



                if (isNaN(maxDiaryNumber)) {
                    maxDiaryNumber = 1;
                }
                newDiaryNumber = maxDiaryNumber !== null ? parseInt(maxDiaryNumber) : 1;

            } else if (userType === "Officer") {
                // Find all userIds with sharedDesignations
                const userIdsWithSharedDesignations = await Employees.findAll({
                    where: { userType: "Officer" },
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: []
                    }],
                    attributes: ['fkUserId']
                }).then(users => users.map(user => user.fkUserId));

                // Find the max diaryNumber, excluding userIds with sharedDesignations
                let maxDiaryNumber = await FileUserDiares.max('diaryNumber', {
                    where: {
                        fkFileId: fileId,
                        fkCaseId: caseId,
                        fkSubmittedByUserId: { [db.Sequelize.Op.notIn]: userIdsWithSharedDesignations }
                    }
                });

                if (isNaN(maxDiaryNumber)) {
                    maxDiaryNumber = 0;
                }
                newDiaryNumber = maxDiaryNumber !== null ? maxDiaryNumber + 1 : 0;
            }
            // Create the fileRemark
            const fileRemark = await FileRemarks.create({
                fkFileId: fileId,
                fkCaseId: caseId,
                submittedBy: req.submittedBy,
                assignedTo: req.assignedTo,
                CommentStatus: req.CommentStatus ? req.CommentStatus : null,
                comment: req.comment ? req.comment : null
            });

            // Create the fileDiary with the new diaryNumber for the submitting user
            await FileUserDiares.create({
                fkFileId: fileId,
                fkCaseId: caseId,
                fkSubmittedByUserId: req.submittedBy,
                diaryNumber: newDiaryNumber
            });

            await FileNotifications.create({
                fkUserId: req.assignedTo,
                readStatus: false,
                fkFileId: fileId,
                fkCaseId: caseId
            })



            // if (files && files.length > 0) {
            //     // await FileSignatures.destroy({ where: {fkUserId : req.submittedBy}})
            //     const attachments = files.map(file => {
            //         const path = file.destination.replace('./public/', '/public/');
            //         return {
            //             signature: `${path}/${file.filename}`,
            //             fkUserId: req.submittedBy,
            //             fkFileId: fileId,
            //             fkCaseId: caseId
            //         };
            //     });
            //     await FileSignatures.bulkCreate(attachments);
            // }
            // if (files && files.length > 0) {
            //     await FileSignatures.destroy({ where: {fkUserId : req.submittedBy}})
            //     // Check if files already exist for the fkUserId
            //     const existingFiles = await FileSignatures.findAll({
            //         where: {
            //             fkUserId: req.submittedBy,
            //             fkFileId: fileId,
            //             fkCaseId: caseId
            //         }
            //     });

            //     // Extract existing filenames
            //     const existingFilenames = existingFiles.map(file => file.filename);

            //     // Filter out new files that don't already exist
            //     const newFiles = files.filter(file => !existingFilenames.includes(file.filename));

            //     // Map new files to attachments
            //     const attachments = newFiles.map(file => {
            //         const path = file.destination.replace('./public/', '/public/');
            //         return {
            //             signature: `${path}/${file.filename}`,
            //             fkUserId: req.submittedBy,
            //             fkFileId: fileId,
            //             fkCaseId: caseId
            //         };
            //     });

            //     // Bulk create new attachments
            //     if (attachments.length > 0) {
            //         await FileSignatures.bulkCreate(attachments);
            //     } else {
            //         console.log("Files already exist for fkUserId. Skipping addition of new files.");
            //     }
            // }

            // if (files && files.length > 0) {
            //     // Check if files contain the second type of file object
            //     // const isSecondType = files[0].fieldname && files[0].originalname && files[0].destination;

            //     // // If it's the second type of file object, proceed as usual
            //     // if (isSecondType) {
            //     const attachments = files.map(file => {
            //         const path = file.destination.replace('./public/', '/public/');
            //         return {
            //             signature: `${path}/${file.filename}`,
            //             fkUserId: req.submittedBy,
            //             fkFileId: fileId,
            //             fkCaseId: caseId
            //         };
            //     });
            //     await FileSignatures.bulkCreate(attachments);
            //     //  } 
            // }
            // else {
            //     // console.log(req.signature)
            //     // If it's the first type (only file path), create a file object and process it
            //     const attachments = [{
            //         signature: req.signature,
            //         fkUserId: req.submittedBy,
            //         fkFileId: fileId,
            //         fkCaseId: caseId
            //     }];
            //     await FileSignatures.bulkCreate(attachments);
            // }


            return fileRemark;
        } catch (error) {
            throw new Error(error.message || "Error Creating Case!");
        }
    },

    // Get Signature By User Id
    getSignatureById: async (userId) => {
        try {

            const signature = await FileSignatures.findOne({
                where: { fkUserId: userId },
                include: [
                    {
                        model: Users,
                        as: 'users',
                        attributes: ['id'],
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName'],
                                include: [{
                                    model: Designations,
                                    as: 'designations',
                                    attributes: ['id', 'designationName']
                                }]
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 1
            });

            return signature
        } catch (error) {
            console.error('Error Fetching Case:', error.message);
        }
    },

    // Get File Details On the Case
    // getSingleCaseDetails: async (fileId, caseId) => {
    //     try {

    //         let digitalSignatureWhere = {};
    //         if (fileId && caseId) {
    //             digitalSignatureWhere = {
    //                 fkFileId: fileId,
    //                 fkCaseId: caseId
    //             };
    //         }
    //         // Retrieve case details including associated file and section cases
    //         const caseDetails = await Cases.findAll({
    //             where: { id: caseId, fkFileId: fileId },
    //             attributes: ['id', 'isEditable'],
    //             include: [
    //                 {
    //                     model: Files,
    //                     as: 'files',
    //                 },
    //                 {
    //                     model: FileSignatures,
    //                     as: 'digitalSignature',
    //                     where: digitalSignatureWhere,
    //                     attributes: ['id', 'signature', 'fkUserId', 'createdAt', 'updatedAt'],
    //                     required: false,
    //                     include: [
    //                         {
    //                             model: Users,
    //                             as: 'users',
    //                             attributes: ['id'],
    //                             include: [
    //                                 {
    //                                     model: Employees,
    //                                     as: 'employee',
    //                                     attributes: ['id', 'firstName', 'lastName', 'userType'],
    //                                     include: [{
    //                                         model: Designations,
    //                                         as: 'designations',
    //                                         attributes: ['id', 'designationName']
    //                                     }]
    //                                 }
    //                             ]
    //                         }
    //                     ],
    //                 },
    //                 {
    //                     model: FreshReceipts,
    //                     as: 'freshReceipts',
    //                     include: [
    //                         {
    //                             model: FreshReceiptAttachments,
    //                             as: 'freshReceiptsAttachments',
    //                             attributes: ['id', 'filename']
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     model: SectionCases,
    //                     as: 'sectionCases',
    //                     include: [
    //                         {
    //                             model: CaseAttachments,
    //                             as: 'caseAttachments',
    //                             attributes: ['id', 'fileName']
    //                         }
    //                     ],
    //                     attributes: ['id', 'fkCaseId', 'sectionType', 'description'],
    //                 },
    //                 {
    //                     model: FileRemarks,
    //                     as: 'casesRemarks',
    //                     separate: true,
    //                     order: [['id', 'DESC']],
    //                     attributes: ['id', 'assignedTo', 'submittedBy', 'fkFileId', 'fkCaseId', 'comment', 'CommentStatus', 'createdAt', 'updatedAt'],
    //                     include: [
    //                         {
    //                             model: Users,
    //                             as: 'submittedUser',
    //                             attributes: ['id'],
    //                             include: [
    //                                 {
    //                                     model: Employees,
    //                                     as: 'employee',
    //                                     attributes: ['id', 'firstName', 'lastName', 'userType'],
    //                                     include: [
    //                                         {
    //                                             model: Designations,
    //                                             as: 'designations',
    //                                             attributes: ['id', 'designationName']
    //                                         }
    //                                     ]
    //                                 }
    //                             ],
    //                         },
    //                         {
    //                             model: Users,
    //                             as: 'assignedUser',
    //                             attributes: ['id'],
    //                             include: [
    //                                 {
    //                                     model: Employees,
    //                                     as: 'employee',
    //                                     attributes: ['id', 'firstName', 'lastName', 'userType'],
    //                                     include: [
    //                                         {
    //                                             model: Designations,
    //                                             as: 'designations',
    //                                             attributes: ['id', 'designationName']
    //                                         }
    //                                     ]
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     model: FileUserDiares,
    //                     as: 'fileDiary',
    //                     include: [
    //                         {
    //                             model: Users,
    //                             as: 'submittedByUser',
    //                             attributes: ['id'],
    //                             include: [
    //                                 {
    //                                     model: Employees,
    //                                     as: 'employee',
    //                                     attributes: ['id', 'firstName', 'lastName'],
    //                                     include: [
    //                                         {
    //                                             model: Departments,
    //                                             as: 'departments',
    //                                             attributes: ['id', 'departmentName']
    //                                         },
    //                                         {
    //                                             model: Branches,
    //                                             as: 'branches',
    //                                             attributes: ['id', 'branchName']
    //                                         }

    //                                     ],

    //                                 }
    //                             ]
    //                         },
    //                     ]
    //                 },


    //             ],

    //         });


    //         let formattedData = {};


    //         caseDetails.forEach(caseDetail => {
    //             const { files, freshReceipts, sectionCases, casesRemarks, fileDiary, digitalSignature } = caseDetail;

    //             const fkCaseId = sectionCases[0].fkCaseId;

    //             // Map section cases and include attachments
    //             const sections = sectionCases.map(section => {
    //                 const { id, sectionType, description, caseAttachments } = section;
    //                 return {
    //                     id,
    //                     sectionType,
    //                     description,
    //                     caseAttachments
    //                 };
    //             });

    //             casesRemarks.forEach(remark => {
    //                 const formattedDateCreatedAt = moment(remark.createdAt).tz('Asia/Karachi').format("DD-MM-YYYY");
    //                 const formattedTimeCreatedAt = moment(remark.createdAt).tz('Asia/Karachi').format("hh:mm A");
    //                 remark.dataValues.formattedDateCreatedAt = formattedDateCreatedAt;
    //                 remark.dataValues.formattedTimeCreatedAt = formattedTimeCreatedAt
    //             });

    //             formattedData = {
    //                 fkCaseId,
    //                 isEditable: caseDetail.isEditable,
    //                 fileDetails: files,
    //                 freshReceipts: freshReceipts,
    //                 sections,
    //                 fileRemarks: casesRemarks,
    //                 fileDiary: fileDiary,
    //                 digitalSignature: digitalSignature ? digitalSignature : null

    //             };
    //         });

    //         return { cases: formattedData };
    //     } catch (error) {
    //         console.log(error)
    //         console.error('Error Fetching Case:', error.message);
    //         throw new Error("Error Fetching Single Case");
    //     }
    // },



// // Get File Details On the Case if FR is not there
// getSingleCaseDetails: async (fileId, caseId) => {
//     try {
//         // Fetch the primary details of the case notes
//         const caseNotes = await CaseNotes.findOne({
//             where: {
//                 fkFileId: fileId,
//                 fkCaseId: caseId
//             },
//             attributes: ['id', 'fkBranchId', 'notingSubject', 'fkCorrespondenceIds']
//         });

//         const cases = await Cases.findOne({
//             where: { id: caseId, fkFileId: fileId },
//             attributes: ['id', 'isEditable'],
//             include: [
//                 {
//                     model: Files,
//                     as: 'files',
//                 },
//                 {
//                     model: FreshReceipts,
//                     as: 'freshReceipts',
//                     include: [
//                         {
//                             model: FreshReceiptAttachments,
//                             as: 'freshReceiptsAttachments',
//                             attributes: ['id', 'filename']
//                         }
//                     ]
//                 },
//                 {
//                     model: FileRemarks,
//                     as: 'casesRemarks',
//                     separate: true,
//                     order: [['id', 'DESC']],
//                     attributes: ['id', 'assignedTo', 'submittedBy', 'fkFileId', 'fkCaseId', 'comment', 'CommentStatus', 'createdAt', 'updatedAt'],
//                     include: [
//                         {
//                             model: Users,
//                             as: 'submittedUser',
//                             attributes: ['id'],
//                             include: [
//                                 {
//                                     model: Employees,
//                                     as: 'employee',
//                                     attributes: ['id', 'firstName', 'lastName', 'userType'],
//                                     include: [
//                                         {
//                                             model: Designations,
//                                             as: 'designations',
//                                             attributes: ['id', 'designationName']
//                                         }
//                                     ]
//                                 }
//                             ],
//                         },
//                         {
//                             model: Users,
//                             as: 'assignedUser',
//                             attributes: ['id'],
//                             include: [
//                                 {
//                                     model: Employees,
//                                     as: 'employee',
//                                     attributes: ['id', 'firstName', 'lastName', 'userType'],
//                                     include: [
//                                         {
//                                             model: Designations,
//                                             as: 'designations',
//                                             attributes: ['id', 'designationName']
//                                         }
//                                     ]
//                                 }
//                             ]
//                         }
//                     ]
//                 },
//                 {
//                     model: FileUserDiares,
//                     as: 'fileDiary',
//                     include: [
//                         {
//                             model: Users,
//                             as: 'submittedByUser',
//                             attributes: ['id'],
//                             include: [
//                                 {
//                                     model: Employees,
//                                     as: 'employee',
//                                     attributes: ['id', 'firstName', 'lastName'],
//                                     include: [
//                                         {
//                                             model: Departments,
//                                             as: 'departments',
//                                             attributes: ['id', 'departmentName']
//                                         },
//                                         {
//                                             model: Branches,
//                                             as: 'branches',
//                                             attributes: ['id', 'branchName']
//                                         }
//                                     ]
//                                 }
//                             ]
//                         },
//                     ]
//                 },
//             ],
//         });

//         if (!caseNotes) {
//             return {}; 
//         }

//         // Fetch the note paragraphs associated with the case notes
//         const noteParas = await NoteParagraphs.findAll({
//             where: { fkCaseNoteId: caseNotes.id },
//             attributes: ['paragraphTitle', 'paragraph', 'flags'],
//             order: [['createdAt', 'ASC']]
//         });

//         // Filter and fetch correspondences only for non-null IDs
//         const validCorrespondenceIds = caseNotes.fkCorrespondenceIds.filter(id => id !== null);

//         const correspondences = await Correspondences.findAll({
//             where: { id: { [Op.in]: validCorrespondenceIds } },
//             include: [{
//                 model: CorrespondenceAttachments,
//                 as: 'correspondenceAttachments',
//                 attributes: ['id', 'file']
//             }]
//         });

//         let correspondenceMap = {};
//         correspondences.forEach(corr => {
//             correspondenceMap[corr.id] = {
//                 id: corr.id,
//                 name: corr.name,
//                 description: corr.description,
//                 attachments: corr.correspondenceAttachments.map(att => ({
//                     id: att.id,
//                     file: att.file,
//                 }))
//             };
//         });

//         noteParas.sort((a, b) => {
//             const titleA = a.paragraphTitle.toLowerCase();
//             const titleB = b.paragraphTitle.toLowerCase();
//             if (titleA < titleB) return -1;
//             if (titleA > titleB) return 1;
//             return 0;
//         });

//         const paragraphArray = noteParas.map((para) => {
//             const flags = para.flags ? para.flags.split(',') : [];
//             let references = [];
//             let usedCorrespondenceIds = new Set();

//             flags.forEach((flag) => {
//                 const correspondenceId = validCorrespondenceIds.shift(); 
                
//                 if (correspondenceId && correspondenceMap[correspondenceId] && !usedCorrespondenceIds.has(correspondenceId)) {
//                     usedCorrespondenceIds.add(correspondenceId);
//                     references.push({
//                         flag: flag.trim(),
//                         id: correspondenceId,
//                         attachments: [{
//                             id: correspondenceMap[correspondenceId].id,
//                             name: correspondenceMap[correspondenceId].name,
//                             description: correspondenceMap[correspondenceId].description,
//                             attachments: correspondenceMap[correspondenceId].attachments
//                         }]
//                     });
//                 }
//             });

//             return {
//                 title: para.paragraphTitle,
//                 description: para.paragraph,
//                 references: references
//             };
//         });

//         // Filter out duplicate paragraphs
//         const uniqueParagraphArray = paragraphArray.filter((para, index, self) =>
//             index === self.findIndex((p) => (
//                 p.title === para.title && p.description === para.description
//             ))
//         );

//         // Assemble the final response
//         const response = {
//             cases: cases,
//             caseNoteId: caseNotes.id,
//             fkBranchId: caseNotes.fkBranchId,
//             notingSubject: caseNotes.notingSubject,
//             paragraphArray: uniqueParagraphArray // Use the filtered paragraph array
//         };

//         return response;
//     } catch (error) {
//         console.error("Error Fetching Case Details", error);
//         throw new Error(error.message || "Error Fetching Case Details");
//     }
// },




// Get File Details On the Case if FR is available
getSingleCaseDetails: async (fileId, caseId) => {
    try {
        const caseNotes = await CaseNotes.findOne({
            where: {
                fkFileId: fileId,
                fkCaseId: caseId
            },
            attributes: ['id', 'fkBranchId', 'notingSubject', 'fkCorrespondenceIds', 'fkFreshReciptIds']
        });

        if (!caseNotes) {
            return {};
        }

        const cases = await Cases.findOne({
            where: { id: caseId, fkFileId: fileId },
            attributes: ['id', 'isEditable'],
            include: [
                {
                    model: Files,
                    as: 'files',
                },
                {
                    model: FreshReceipts,
                    as: 'freshReceipts',
                    include: [
                        {
                            model: FreshReceiptAttachments,
                            as: 'freshReceiptsAttachments',
                            attributes: ['id', 'filename']
                        }
                    ]
                },
                {
                    model: FileRemarks,
                    as: 'casesRemarks',
                    separate: true,
                    order: [['id', 'DESC']],
                    attributes: ['id', 'assignedTo', 'submittedBy', 'fkFileId', 'fkCaseId', 'comment', 'CommentStatus', 'createdAt', 'updatedAt'],
                    include: [
                        {
                            model: Users,
                            as: 'submittedUser',
                            attributes: ['id'],
                            include: [
                                {
                                    model: Employees,
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
                        {
                            model: Users,
                            as: 'assignedUser',
                            attributes: ['id'],
                            include: [
                                {
                                    model: Employees,
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
                            ]
                        }
                    ]
                },
                {
                    model: FileUserDiares,
                    as: 'fileDiary',
                    include: [
                        {
                            model: Users,
                            as: 'submittedByUser',
                            attributes: ['id'],
                            include: [
                                {
                                    model: Employees,
                                    as: 'employee',
                                    attributes: ['id', 'firstName', 'lastName'],
                                    include: [
                                        {
                                            model: Departments,
                                            as: 'departments',
                                            attributes: ['id', 'departmentName']
                                        },
                                        {
                                            model: Branches,
                                            as: 'branches',
                                            attributes: ['id', 'branchName']
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                },
            ],
        });

        const noteParas = await NoteParagraphs.findAll({
            where: { fkCaseNoteId: caseNotes.id },
            attributes: ['paragraphTitle', 'paragraph', 'flags'],
            order: [['createdAt', 'ASC']]
        });

        const validCorrespondenceIds = caseNotes.fkCorrespondenceIds;
        console.log("validCorrespondenceIds", validCorrespondenceIds);
        const correspondences = await Correspondences.findAll({
            where: { id: { [Op.in]: validCorrespondenceIds } },
            include: [{
                model: CorrespondenceAttachments,
                as: 'correspondenceAttachments',
                attributes: ['id', 'file']
            }]
        });

        const validFreshReceiptIds = caseNotes.fkFreshReciptIds;
        console.log("validFreshReceiptIds", validFreshReceiptIds);
        const freshReceipts = await FreshReceipts.findAll({
            where: { id: { [Op.in]: validFreshReceiptIds } },
            include: [{
                model: FreshReceiptAttachments,
                as: 'freshReceiptsAttachments',
                attributes: ['id', 'filename']
            }]
        });

        let correspondenceMap = {};
        correspondences.forEach(corr => {
            correspondenceMap[corr.id] = {
                id: corr.id,
                name: corr.name,
                description: corr.description,
                attachments: corr.correspondenceAttachments.map(att => ({
                    id: att.id,
                    file: att.file,
                }))
            };
        });

        console.log("correspondenceMap---", correspondenceMap)

        let freshReceiptMap = {};
        freshReceipts.forEach(fresh => {
            freshReceiptMap[fresh.id] = {
                id: fresh.id,
                attachments: fresh.freshReceiptsAttachments.map(att => ({
                    id: att.id,
                    filename: att.filename
                }))
            };
        });

        console.log("freshReceiptMap---", freshReceiptMap)

        // Create a map to associate flags with their IDs
        const flagIdMap = {};
        let flagIdMapC = {};
        let flagIdMapF = {};

        noteParas.forEach((para, index) => {
            const flags = para.flags ? para.flags.split(',') : [];
            console.log("flags", flags)

            flags.forEach(flag => {
                console.log("validCorrespondenceIds[index]", validCorrespondenceIds[index], index)
                console.log("validFreshReceiptIds[index]", validFreshReceiptIds[index], index)
                const correspondenceId = validCorrespondenceIds[index];
                const freshReceiptId = validFreshReceiptIds[index];

                console.log("correspondenceId", correspondenceId)
                console.log("freshReceiptId", freshReceiptId)

                console.log("flags", flag)
                console.log("flags", flag.trim())

                if (correspondenceId !== null) {
                    flagIdMap[flag.trim()] = correspondenceId;
                    console.log("flagIdMap[flag.trim()]-- C", flagIdMap[flag.trim()])
                }
                if ( freshReceiptId !== null) {
                    flagIdMap[flag.trim()] = freshReceiptId;
                    console.log("flagIdMap[flag.trim()]-- F", flagIdMap[flag.trim()])
                }
            });
        });

        const paragraphArray = noteParas.map((para, index) => {
            const flags = para.flags ? para.flags.split(',') : [];
            let references = [];

            flags.forEach(flag => {
                const reference = { flag: flag.trim(), id:flagIdMap[flag.trim()], attachments: [] };
                console.log("flagIdMap", flagIdMap)

                const correspondenceId = flagIdMap[flag.trim()];
                const freshReceiptsId = flagIdMap[flag.trim()];

                console.log("correspondenceId", correspondenceId)
                console.log("freshReceiptsId", freshReceiptsId)

                console.log("correspondenceMap[correspondenceId]----", correspondenceMap[correspondenceId])
                if (correspondenceId && correspondenceMap[correspondenceId]) {
                
                    const correspondenceAttachment = correspondenceMap[correspondenceId].attachments.map(att => ({
                        id: att.id,
                        file: att.file
                    }));
                    reference.attachments.push({
                        id: correspondenceMap[correspondenceId].id,
                        name: correspondenceMap[correspondenceId].name,
                        description: correspondenceMap[correspondenceId].description,
                        attachments: correspondenceAttachment
                    });

                    console.log("reference C------", reference)
                } else if (freshReceiptsId && freshReceiptMap[freshReceiptsId]) {
                    const freshReceiptAttachments = freshReceiptMap[freshReceiptsId].attachments.map(att => ({
                        id: att.id,
                        filename: att.filename
                    }));
                    console.log("reference F------", reference)
                    reference.attachments.push(...freshReceiptAttachments);

                }
                console.log("references before----", references)
                references.push(reference);
                console.log("references after----", references)
            });

            return {
                title: para.paragraphTitle,
                description: para.paragraph,
                references: references
            };
        });

        // Filter unique paragraphs (if necessary)
        const uniqueParagraphArray = paragraphArray.filter((para, index, self) =>
            index === self.findIndex((p) => (
                p.title === para.title && p.description === para.description
            ))
        );

        // Construct the response
        const response = {
            cases: cases,
            caseNoteId: caseNotes.id,
            fkBranchId: caseNotes.fkBranchId,
            notingSubject: caseNotes.notingSubject,
            paragraphArray: uniqueParagraphArray
        };

        return response;

    } catch (error) {
        console.error("Error Fetching Case Details", error);
        throw new Error(error.message || "Error Fetching Case Details");
    }
},

    // Get Employees on Lower Level By User's Login
    getLowerLevelDesignations: async (userId) => {
        try {
            // Find the user and their branch
            const userWithBranch = await Users.findOne({
                where: { id: userId },
                include: [{
                    model: Employees,
                    as: 'employee',
                    include: [{
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    }]
                }]
            });

            const userBranchId = userWithBranch.employee.branches.id;
            const userBranchName = userWithBranch.employee.branches.branchName;

            const specialBranches = ["Notice Office", "Question", "Motion", "Resolution"];
            let employees;
            let branchHierarchy;

            const branchHierarchyConfig = await BranchHierarchy.findOne({
                where: { branchName: userBranchName }
            });
            branchHierarchy = branchHierarchyConfig.branchHierarchy;

            if (specialBranches.includes(userBranchName)) {
                const noticeOfficeBranchId = await Branches.findOne({
                    where: { branchName: "Notice Office" },
                    attributes: ['id']
                }).then(branch => branch.id);

                const noticeOfficeHierarchy = ["Chairman", "Secretary", "Special Secretary", "Joint Secretary", "Deputy Secretary", "Section Officer"];
                const noticeOfficeEmployees = await Employees.findAll({
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: ['designationName'],
                        where: { designationName: { [Op.in]: noticeOfficeHierarchy } }
                    }],
                    where: { fkBranchId: noticeOfficeBranchId }
                });



                const userBranchSuperintendent = await Employees.findAll({
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: ['designationName'],
                        where: { designationName: { [Op.in]: branchHierarchy } }
                    }],
                    where: { fkBranchId: userBranchId }
                });

                employees = [...noticeOfficeEmployees, ...userBranchSuperintendent];
            } else {

                employees = await Employees.findAll({
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: ['id', 'designationName'],
                        where: { designationName: { [Op.in]: branchHierarchy } }
                    }],
                    where: { fkBranchId: userBranchId }
                });
            }

            // Sort employees based on the branch hierarchy
            const designationMap = branchHierarchy.reduce((acc, designation, index) => {
                acc[designation] = index;
                return acc;
            }, {});

            // Sort employees based on their mapped positions in the hierarchy
            employees.sort((a, b) => {
                const designationA = a.designations.designationName;
                const designationB = b.designations.designationName;
                return designationMap[designationA] - designationMap[designationB];
            });


            return employees
        } catch (error) {
            console.error('Error Fetching Designations:', error.message);
            throw new Error("Error Fetching Designations");
        }
    },

    // Get Employees on Higher Level By User's Login
    getHigherLevelDesignations: async (userId) => {
        try {
            // Find the user and their branch
            const userWithBranch = await Users.findOne({
                where: { id: userId },
                include: [{
                    model: Employees,
                    as: 'employee',
                    include: [{
                        model: Branches,
                        as: 'branches',
                        attributes: ['id', 'branchName']
                    }]
                }]
            });

            const userBranchId = userWithBranch.employee.branches.id;
            const userBranchName = userWithBranch.employee.branches.branchName;

            const specialBranches = ["Notice Office", "Question", "Motion", "Resolution"];
            let employees;
            let branchHierarchy;
            let highLevelDesignations = [];
            let lowLevelDesignations = [];

            if (specialBranches.includes(userBranchName)) {
                const noticeOfficeBranchId = await Branches.findOne({
                    where: { branchName: "Notice Office" },
                    attributes: ['id']
                }).then(branch => branch.id);

                // const noticeOfficeHierarchy = ["Chairman", "Secretary", "Special Secretary", "Joint Secretary", "Deputy Secretary", "Section Officer"];
                // const noticeOfficeEmployees = await Employees.findAll({
                //     include: [{
                //         model: Designations,
                //         as: 'designations',
                //         attributes: ['designationName'],
                //         where: { designationName: { [Op.in]: noticeOfficeHierarchy } }
                //     }],
                //     where: { fkBranchId: noticeOfficeBranchId }
                // });

                const branchHierarchyConfig = await BranchHierarchy.findOne({
                    where: { branchName: userBranchName },
                    attributes: ['id', 'branchHierarchy', 'lowerLevelHierarchy', 'higherLevelHierarchy']
                });

                if (branchHierarchyConfig) {
                    branchHierarchy = branchHierarchyConfig.branchHierarchy;
                    highLevelDesignations = branchHierarchyConfig.higherLevelHierarchy || [];
                    lowLevelDesignations = branchHierarchyConfig.lowerLevelHierarchy || [];
                }


                const userBranchSuperintendent = await Employees.findAll({
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: ['designationName'],
                        where: { designationName: { [Op.in]: branchHierarchy } }
                    }],
                    where: { fkBranchId: userBranchId }
                });

                employees = [...userBranchSuperintendent];
            } else {
                const branchHierarchyConfig = await BranchHierarchy.findOne({
                    where: { branchName: userBranchName }
                });
                if (branchHierarchyConfig) {
                    branchHierarchy = branchHierarchyConfig.branchHierarchy;
                    highLevelDesignations = branchHierarchyConfig.higherLevelHierarchy || [];
                    lowLevelDesignations = branchHierarchyConfig.lowerLevelHierarchy || [];
                }

                employees = await Employees.findAll({
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: ['id', 'designationName'],
                        where: { designationName: { [Op.in]: branchHierarchy } }
                    }],
                    where: { fkBranchId: userBranchId }
                });
            }
            // Sort employees based on the branch hierarchy
            // const designationMap = branchHierarchy.reduce((acc, designation, index) => {
            //     acc[designation] = index;
            //     return acc;
            // }, {});

            const designationColorMap = branchHierarchy.reduce((acc, designation) => {
                if (highLevelDesignations.includes(designation)) {
                    acc[designation] = 'Green'; // High level color
                } else if (lowLevelDesignations.includes(designation)) {
                    acc[designation] = 'Blue'; // Low level color
                }
                return acc;
            }, {});

            // Sort employees based on their mapped positions in the hierarchy
            // employees.sort((a, b) => {
            //     const designationA = a.designations.designationName;
            //     const designationB = b.designations.designationName;
            //     return designationMap[designationA] - designationMap[designationB];
            // });

            employees = employees.map(employee => ({
                ...employee.dataValues,
                color: designationColorMap[employee.designations.designationName]
            })).sort((a, b) => {
                const positionA = branchHierarchy.indexOf(a.designations.designationName);
                const positionB = branchHierarchy.indexOf(b.designations.designationName);
                return positionA - positionB;
            });


            return employees
        } catch (error) {
            console.error('Error Fetching Designations:', error.message);
            throw new Error("Error Fetching Designations");
        }
    },

    // Get Branches By User Login
    getBranchesByUserLogin: async (userId) => {
        try {
            // Find the department of the user
            const user = await Users.findOne({
                where: { id: userId },
                include: [
                    {
                        model: Employees,
                        as: 'employee',
                        attributes: ['id', 'firstName', 'lastName'],
                        include: [
                            {
                                model: Branches,
                                as: 'branches',
                                attributes: ['id', 'branchName']
                            }
                        ]
                    }
                ]
            });

            const branchId = user.employee.branches.id;
            // Find all employees who belong to the same department
            const branches = await Branches.findOne({
                where: { id: branchId },

            });

            return branches;
        } catch (error) {
            console.error('Error Fetching Branches:', error.message);
            throw new Error("Error Fetching Branches");
        }
    }

}

module.exports = casesService