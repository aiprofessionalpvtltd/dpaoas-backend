const db = require("../models");
const Divisions = db.divisions;
const Branches = db.branches
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
const Employees = db.employees
const Op = db.Sequelize.Op;
const logger = require('../common/winston');



const casesService = {


    // Create Case For The File
    createCase: async (data, files, fileId, createdBy, freshReceiptId) => {
        try {
            const caseModel = await Cases.create({

                fkFileId: fileId,
                createdBy: createdBy,
                fkFreshReceiptId: freshReceiptId
            })


            const createdCases = [];

            // Assuming `data` is structured as `cases` being the top-level key
            const cases = data['cases'];

            // Find the highest caseId for the current fileId
            await SectionCases.findOne({
                where: { fkCaseId: caseModel.id },
                order: [['fkCaseId', 'DESC']],
                attributes: ['fkCaseId'],
            });


            // Iterate over each case in the `cases` array
            for (const caseItem of cases) {
                const caseSections = Object.keys(caseItem);

                for (const sectionType of caseSections) {
                    const sectionData = caseItem[sectionType];
                    const { description } = sectionData;



                    // Create a new record in sectionsCases table for the current section
                    const createdCase = await SectionCases.create({
                        fkCaseId: caseModel.id, // Use the sequential caseId
                        sectionType: sectionType,
                        description: description,
                    });

                    createdCases.push(createdCase);

                    // Process files for the current section
                    const sectionFiles = files.filter(file =>
                        file.fieldname.startsWith(`cases[0][${sectionType}][sections]`)
                    );

                    if (sectionFiles.length > 0) {
                        const attachments = sectionFiles.map(file => {
                            const path = file.destination.replace('./public/', '/public/');
                            return {
                                fileName: `${path}/${file.filename}`,
                                fkSectionId: createdCase.id,
                            };
                        });

                        // Bulk create attachments in the database
                        await CaseAttachments.bulkCreate(attachments);
                    }
                }
            }

            return createdCases;
        } catch (error) {
            throw new Error(error.message || "Error Creating Case!");
        }
    },

    // Get Cases By File Id
    getCasesByFileId: async (fileId, userId, currentPage, pageSize) => {
        try {
            // Fetch all relevant cases and their remarks, without filtering by userId
            const allRelevantSections = await SectionCases.findAll({
                include: [
                    {
                        model: CaseAttachments,
                        as: 'caseAttachments',
                        attributes: ['id', 'fileName'],
                    },
                    {
                        model: Cases,
                        as: 'cases',
                        where: { fkFileId: fileId },
                        attributes: ['id', 'fkFileId', 'createdBy', 'createdAt', 'updatedAt'],
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
                                    },
                                ],
                            },
                            {
                                model: FileRemarks,
                                as: 'casesRemarks',
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
                                            },
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
                                                attributes: ['id', 'firstName', 'lastName'],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                attributes: ['id', 'fkCaseId', 'sectionType', 'description'],
                order: [['id', 'ASC']],
            });

            //    // Filter the cases based on the logic for assignedTo and createdBy
            //     const filteredCases = allRelevantSections.filter(section => {
            //         const caseData = section.cases || {};
            //         const remarks = caseData.casesRemarks || [];
            //         const isCreatedByUser = parseInt(caseData.createdBy) === parseInt(userId);
            //         const isAssignedToUser = remarks.some(remark => parseInt(remark.assignedTo) === parseInt(userId));
            //         return isAssignedToUser || (isCreatedByUser && !remarks.some(remark => remark.assignedTo));
            //     });

            const filteredCases = allRelevantSections.filter(section => {
                const caseData = section.cases || {};
                const remarks = caseData.casesRemarks || [];
                const isCreatedByUser = parseInt(caseData.createdBy) === parseInt(userId);
                const lastRemark = remarks.reduce((latest, remark) => {
                    return latest.createdAt > remark.createdAt ? latest : remark;
                }, { createdAt: new Date(0) });
                const isAssignedToUser = parseInt(lastRemark.assignedTo) === parseInt(userId);
                return isAssignedToUser || (isCreatedByUser && !remarks.some(remark => remark.assignedTo));
            });

            const casesByCaseId = {};
            filteredCases.forEach(section => {
                const { fkCaseId, sectionType, description, caseAttachments } = section;
                const fileData = section.cases.files || {};
                const freshReceiptData = section.cases.freshReceipts || {}
                const fileRemarksData = section.cases.casesRemarks || {};
                const caseDate = section.cases.createdAt || 0
                if (!casesByCaseId[fkCaseId]) {
                    // Initialize the case object with fileData and fileRemarksData at the root level
                    casesByCaseId[fkCaseId] = { fkCaseId, caseDate, fileData, freshReceiptData, fileRemarksData };
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
                        //  where: { fkFileId: fileId, createdBy: userId },
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
                                        attributes: ['id', 'firstName', 'lastName']
                                    }
                                ]
                            },
                            {
                                model: FileRemarks,
                                as: 'casesRemarks',
                                include: [
                                    {
                                        model: Users,
                                        as: 'submittedUser',
                                        attributes: ['id'],
                                        include: [
                                            {
                                                model: Employees,
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
                                                model: Employees,
                                                as: 'employee',
                                                attributes: ['id', 'firstName', 'lastName']
                                            }
                                        ]
                                    },
                                ]
                            }
                        ]
                    }
                ],
                attributes: ['id', 'fkCaseId', 'sectionType', 'description'],
                order: [['id', 'ASC']],
            });

            // Aggregate sections by caseId
            const casesByCaseId = {};
            allSections.forEach(section => {
                const { fkCaseId, sectionType, description, caseAttachments } = section;
                const fileData = section.cases.files || {};
                const freshReceiptData = section.cases.freshReceipts || {}
                const fileRemarksData = section.cases.casesRemarks || {};
                const caseDate = section.cases.createdAt || 0


                if (!casesByCaseId[fkCaseId]) {
                    casesByCaseId[fkCaseId] = { fkCaseId, caseDate, fileData, freshReceiptData, fileRemarksData };
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

    getSingleCase: async (fileId, caseId) => {
        try {

            const caseFile = await Cases.findAll({
                where: { id: caseId, fkFileId: fileId }
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
                casesByCaseId[fkCaseId][sectionType] = { description, caseAttachments };
            });
            const cases = Object.values(casesByCaseId);

            return cases
        } catch (error) {
            console.error('Error Fetching Case:', error.message);
        }
    },

    // Update Case For The File
    updateCase: async (data, files, fileId, caseId) => {
        try {


            const updatedCases = [];
            const cases = data['cases'];

            for (const caseItem of cases) {
                for (const sectionType in caseItem) {
                    const sectionData = caseItem[sectionType];
                    const { description } = sectionData;

                    const caseModel = await Cases.findOne({
                        where: {
                            id: caseId,
                            fkFileId: fileId
                        }
                    });

                    // Fetch or create the case section
                    let existingCaseSection = await SectionCases.findOrCreate({
                        where: {
                            fkCaseId: caseModel.id,
                            sectionType: sectionType,
                        },
                        defaults: { description: description }
                    });

                    const [section, wasCreated] = existingCaseSection;
                    if (!wasCreated && section.description !== description) {
                        section.description = description;
                        await section.save();
                    }
                    updatedCases.push(section);

                    // Retrieve existing attachments for this section
                    const existingAttachments = await CaseAttachments.findAll({
                        where: { fkSectionId: section.id }
                    });

                    const existingAttachmentIds = existingAttachments.map(a => a.id);

                    // Filter files for the current sectionType
                    const filteredFiles = files.filter(file => {
                        return file.fieldname.includes(`[${sectionType}]`);
                    });


                    for (const file of filteredFiles) {
                        const path = file.destination.replace('./public/', '/public/');
                        const filePath = `${path}/${file.filename}`;

                        if (file.id && existingAttachmentIds.includes(file.id)) {
                            continue;
                        }

                        // Check if a new file needs to be added or an existing file needs to be updated
                        const existingAttachment = existingAttachments.find(a => a.fileName === filePath);

                        if (!existingAttachment) {
                            await CaseAttachments.create({
                                fileName: filePath,
                                fkSectionId: section.id
                            });
                        } else if (existingAttachment && file.id) {
                            existingAttachment.fileName = filePath;
                            await existingAttachment.save();
                        }
                    }
                }
            }

            return updatedCases;
        } catch (error) {
            throw { message: error.message || "Error Updating Case!" };
        }
    },

    // Assign Case
    assignCase: async (fileId, caseId, req) => {
        try {
            // Create the fileRemark
            const fileRemark = await FileRemarks.create({
                fkFileId: fileId,
                fkCaseId: caseId,
                submittedBy: req.submittedBy,
                assignedTo: req.assignedTo,
                CommentStatus: req.CommentStatus,
                comment: req.comment
            });

            // Create the fileDiary with the new diaryNumber
            await FileUserDiares.create({
                fkFileId: fileId,
                fkCaseId: caseId,
                fkSubmittedByUserId: req.submittedBy,
                diaryNumber: req.diaryNumber
            });

            return fileRemark;
        } catch (error) {
            throw new Error(error.message || "Error Creating Case!");
        }
    },

    // Get File Details On the Case
    getSingleCaseDetails: async (fileId, caseId) => {
        try {
            // Retrieve case details including associated file and section cases
            const caseDetails = await Cases.findAll({
                where: { id: caseId, fkFileId: fileId },
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
                        model: SectionCases,
                        as: 'sectionCases',
                        include: [
                            {
                                model: CaseAttachments,
                                as: 'caseAttachments',
                                attributes: ['id', 'fileName']
                            }
                        ],
                        attributes: ['id', 'fkCaseId', 'sectionType', 'description'],
                    },
                    {
                        model: FileRemarks,
                        as: 'casesRemarks',
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
                                // separate: true, 
                                include: [
                                    {
                                        model: Employees,
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

                                        ],

                                    }
                                ]
                            },
                        ]
                    }
                ]
            });

            // Process the retrieved data to format it as desired
            let formattedData = {};

            caseDetails.forEach(caseDetail => {
                const { files, freshReceipts, sectionCases, casesRemarks, fileDiary } = caseDetail;
                const fkCaseId = sectionCases[0].fkCaseId; // Assume all section cases belong to the same case

                // Map section cases and include attachments
                const sections = sectionCases.map(section => {
                    const { id, sectionType, description, caseAttachments } = section;
                    return {
                        id,
                        sectionType,
                        description,
                        caseAttachments
                    };
                });

                formattedData = {
                    fkCaseId,
                    fileDetails: files,
                    freshReceipts: freshReceipts,
                    sections,
                    fileRemarks: casesRemarks,
                    fileDiary: fileDiary,

                };
            });

            return { cases: formattedData };
        } catch (error) {
            console.error('Error Fetching Case:', error.message);
            throw new Error("Error Fetching Single Case");
        }
    },

    // Get Employees on Lower Level By User's Login
    getLowerLevelDesignations: async (userId) => {
        try {
            // Find the user and their designation
            const userWithDesignation = await Users.findOne({
                where: { id: userId },
                include: [{
                    model: Employees,
                    as: 'employee',
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: ['designationName']
                    }]
                }]
            });

            const filteredEmployees = await Employees.findAll({
                include: [{
                    model: Designations,
                    as: 'designations',
                    attributes: ['designationName']
                }],
                where: {
                    [Op.and]: [
                        { fkBranchId: userWithDesignation.employee.fkBranchId },
                        {
                            '$designations.designationName$': {
                                [Op.in]: ["Director General","Director","Section Officer","Superintendent", "IT Assistant", "Sub Assistant", "Junior Assistant"]
                            }
                        }
                    ]
                }
            });

            const customOrder = [
                "Director General",
                "Personal Assistant To Director General",
                "Director",
                "Personal Assistant To Director",
                "Section Officer",
                "Superintendent",
                "IT Assistant",
                "Sub Assistant",
                "Junior Assistant"
            ];

            const sortedEmployees = filteredEmployees.sort((a, b) => {
                const designationNameA = a.designations.designationName;
                const designationNameB = b.designations.designationName;

                const indexA = customOrder.indexOf(designationNameA);
                const indexB = customOrder.indexOf(designationNameB);

                return indexA - indexB;
            });

            return sortedEmployees;


            return filteredEmployees;
        } catch (error) {
            console.error('Error Fetching Designations:', error.message);
            throw new Error("Error Fetching Designations");
        }
    },

    // Get Employees on Higher Level By User's Login
    getHigherLevelDesignations: async (userId) => {
        try {
            // Find the user and their designation
            const userWithDesignation = await Users.findOne({
                where: { id: userId },
                include: [{
                    model: Employees,
                    as: 'employee',
                    include: [{
                        model: Designations,
                        as: 'designations',
                        attributes: ['designationName']
                    }]
                }]
            });

            const filteredEmployees = await Employees.findAll({
                include: [{
                    model: Designations,
                    as: 'designations',
                    attributes: ['designationName']
                }],
                where: {
                    [Op.and]: [
                        { fkBranchId: userWithDesignation.employee.fkBranchId },
                        {
                            '$designations.designationName$': {
                                [Op.in]: ["Director General","Director","Section Officer","Superintendent", "IT Assistant", "Sub Assistant", "Junior Assistant"]
                            }
                        }
                    ]
                }
            });

            const customOrder = [
                "Director General",
                "Personal Assistant To Director General",
                "Director",
                "Personal Assistant To Director",
                "Section Officer",
                "Superintendent",
                "IT Assistant",
                "Sub Assistant",
                "Junior Assistant"
            ];

            const sortedEmployees = filteredEmployees.sort((a, b) => {
                const designationNameA = a.designations.designationName;
                const designationNameB = b.designations.designationName;

                const indexA = customOrder.indexOf(designationNameA);
                const indexB = customOrder.indexOf(designationNameB);

                return indexA - indexB;
            });

            return sortedEmployees;


            return filteredEmployees;
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