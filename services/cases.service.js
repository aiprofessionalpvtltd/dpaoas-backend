const db = require("../models");
const Divisions = db.divisions;
const Branches = db.branches;
const BranchHierarchy = db.branchHierarchies;
const Ministries = db.ministries;
const FreshReceipts = db.freshReceipts;
const FileDiaries = db.fileDiaries;
const FreshReceiptAttachments = db.freshReceiptsAttachments;
const CaseAttachments = db.caseAttachments;
const SectionCases = db.sectionsCases;
const Cases = db.cases;
const Files = db.newFiles;
const FileRemarks = db.fileRemarks;
const FileUserDiares = db.fileUserDiaries;
const Users = db.users;
const Departments = db.departments;
const Designations = db.designations;
const FileNotifications = db.filesNotifications;
const Employees = db.employees;
const FileSignatures = db.fileSignatures;
const CaseNotes = db.caseNotes;
const NoteParagraphs = db.noteParagraphs;
const Correspondences = db.correspondences;
const CorrespondenceAttachments = db.correspondenceAttachments;
const Op = db.Sequelize.Op;
const logger = require("../common/winston");
const { error } = require("../validation/userValidation");

const moment = require("moment-timezone");

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
  // createCase: async (data, fileId, createdBy, freshReceiptId) => {
  //   try {
  //     const caseModel = await Cases.create({
  //       fkFileId: fileId,
  //       createdBy: createdBy,
  //       fkFreshReceiptId: freshReceiptId ? freshReceiptId : null,
  //     });

  //     const caseId = caseModel.id;
  //     const caseNotes = await CaseNotes.create({
  //       fkBranchId: data.fkBranchId,
  //       fkFileId: fileId,
  //       fkCaseId: caseId,
  //       createdBy: createdBy,
  //       notingSubject: data.notingSubject,
  //     });

  //     let paragraphArray = data.paragraphArray;
  //     if (typeof paragraphArray === "string") {
  //       try {
  //         paragraphArray = JSON.parse(paragraphArray);
  //       } catch (error) {
  //         throw new Error("Invalid format for paragraphArray");
  //       }
  //     }

  //     let allCorrespondencesIds = new Array(paragraphArray.length).fill(null);
  //     let allFreshReceiptIds = new Array(paragraphArray.length).fill(null);

  //     if (Array.isArray(paragraphArray) && paragraphArray.length > 0) {
  //       await Promise.all(
  //         paragraphArray.map(async (para, index) => {
  //           let correspondencesIds = [];
  //           let freshReceiptIds = [];

  //           para.references.forEach((ref) => {
  //             if (ref.attachments && Array.isArray(ref.attachments)) {
  //               ref.attachments.forEach((att) => {
  //                 if (att.name) {
  //                   correspondencesIds.push(ref.id);
  //                 } else if (att.filename) {
  //                   freshReceiptIds.push(ref.id);
  //                 }
  //               });
  //             }
  //           });

  //           // Store the first ID found for each type, if any
  //           if (correspondencesIds.length > 0) {
  //             allCorrespondencesIds[index] = correspondencesIds[0];
  //           }
  //           if (freshReceiptIds.length > 0) {
  //             allFreshReceiptIds[index] = freshReceiptIds[0];
  //           }

  //           // add new entry to note paragraph table
  //           console.log("Created By =====>", createdBy);
  //           await NoteParagraphs.create({
  //             fkCaseNoteId: caseNotes.id,
  //             paragraphTitle: para.title,
  //             paragraph: para.description,
  //             createdBy: createdBy,
  //             flags: para.references.map((ref) => ref.flag).join(","),
  //           });
  //         })
  //       );

  //       await CaseNotes.update(
  //         {
  //           fkCorrespondenceIds: allCorrespondencesIds,
  //           fkFreshReciptIds: allFreshReceiptIds,
  //         },
  //         { where: { id: caseNotes.id } }
  //       );
  //     }

  //     return caseNotes;
  //   } catch (error) {
  //     console.error("Error Creating Case", error);
  //     throw new Error(error.message || "Error Creating Case");
  //   }
  // },

  createCase: async (data, fileId, createdBy, freshReceiptId) => {
    const transaction = await db.sequelize.transaction();
  
    try {
      const caseModel = await Cases.create(
        {
          fkFileId: fileId,
          createdBy: createdBy,
          fkFreshReceiptId: freshReceiptId ? freshReceiptId : null,
        },
        { transaction }
      );
  
      const caseId = caseModel.id;
      const caseNotes = await CaseNotes.create(
        {
          fkBranchId: data.fkBranchId,
          fkFileId: fileId,
          fkCaseId: caseId,
          createdBy: createdBy,
          notingSubject: data.notingSubject,
        },
        { transaction }
      );
  
      let paragraphArray = data.paragraphArray;
      if (typeof paragraphArray === "string") {
        try {
          paragraphArray = JSON.parse(paragraphArray);
        } catch (error) {
          throw new Error("Invalid format for paragraphArray");
        }
      }
  
    

      // Preprocess paragraphArray to check for duplicate flags
      const flagTracker = new Set();
      paragraphArray.forEach((para) => {
        para.references.forEach((ref) => {
          if (flagTracker.has(ref.flag)) {
            throw new Error(
              `The flag '${ref.flag}' is already assigned to '${para.title}'`
            );
          }
          flagTracker.add(ref.flag);
        });
      });

      let allCorrespondencesIds = new Array(paragraphArray.length).fill(null);
      let allFreshReceiptIds = new Array(paragraphArray.length).fill(null);
  
      if (Array.isArray(paragraphArray) && paragraphArray.length > 0) {
        await Promise.all(
          paragraphArray.map(async (para, index) => {
            let correspondencesIds = [];
            let freshReceiptIds = [];
            let flagIds = [];
  
            para.references.forEach((ref) => {
              flagIds.push(ref.id); // Store flag id
  
              if (ref.attachments && Array.isArray(ref.attachments)) {
                ref.attachments.forEach((att) => {
                  if (att.name) {
                    correspondencesIds.push(ref.id); // Correspondence ID
                  } else if (att.filename) {
                    freshReceiptIds.push(ref.id); // FreshReceipt ID
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
            // console.log('para.references[0].flag',para.references[0].flagId); return false;

             const validFlag = await db.flags.findOne({ where: { id: para.references[0].flagId } });

            if (!validFlag) {
              throw new Error(`Flag with id ${para.references[0].flag} does not exist`);
            }
            
             await NoteParagraphs.create(
              {
                fkCaseNoteId: caseNotes.id,
                paragraphTitle: para.title,
                paragraph: para.description,
                createdBy: createdBy,
                flags: validFlag.flag, // Save all flags as string
                fkFlagId: validFlag.id, // Use the valid flag ID
                fkCorrespondenceId: correspondencesIds[0] || null, // Save correspondence ID
              },
              { transaction }
            );
            
          })
        );
  
        await CaseNotes.update(
          {
            fkCorrespondenceIds: allCorrespondencesIds,
            fkFreshReciptIds: allFreshReceiptIds,
          },
          { where: { id: caseNotes.id }, transaction }
        );
      }
  
      await transaction.commit();
      return caseNotes;
    } catch (error) {
      await transaction.rollback();
      console.error("Error Creating Case", error);
      throw new Error(error.message || "Error Creating Case");
    }
  },
  
  // Get Cases By File Id
  getCasesByFileId: async (fileId, userId, currentPage, pageSize) => {
    try {
      const allRelevantSections = await CaseNotes.findAll({
        where: {
          caseStatus: {
            [Op.or]: ["draft", "pending"],
          },
        },
        include: [
          {
            model: Cases,
            as: "cases",
            required: true,
            attributes: [
              "id",
              "fkFileId",
              "isEditable",
              "createdBy",
              "createdAt",
              "updatedAt",
            ],
            ...(fileId ? { where: { fkFileId: fileId } } : {}),
            include: [
              {
                model: Files,
                as: "files",
              },
              {
                model: FreshReceipts,
                as: "freshReceipts",
                include: [
                  {
                    model: FreshReceiptAttachments,
                    as: "freshReceiptsAttachments",
                    attributes: ["id", "filename"],
                  },
                ],
              },
              {
                model: Users,
                as: "createdByUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
                        attributes: ["id", "designationName"],
                      },
                    ],
                  },
                ],
              },
              {
                model: FileRemarks,
                as: "casesRemarks",
                separate: true,
                attributes: [
                  "id",
                  "assignedTo",
                  "submittedBy",
                  "fkFileId",
                  "fkCaseId",
                  "comment",
                  "CommentStatus",
                  "priority",
                  "createdAt",
                  "updatedAt",
                ],
                include: [
                  {
                    model: Users,
                    as: "submittedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Users,
                    as: "assignedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                ],
                order: [["createdAt", "DESC"]],
              },
            ],
          },
        ],
        attributes: [
          "id",
          "fkCaseId",
          "caseStatus",
          "notingSubject",
          "fkCorrespondenceIds",
          "createdAt",
        ],
      });

      const casesByCaseId = {};
      allRelevantSections.forEach((section) => {
        const caseData = section.cases;
        const remarks = caseData.casesRemarks || [];
        const createdBy = parseInt(caseData.createdBy);
        const createdByUser = caseData.createdByUser;

        // Determine visibility and isEditable
        let isVisible = false;
        let isEditable = true;
        let caseStatus = "draft"; // Default status
        let latestRemark;

        // Initial visibility is only for the creator
        if (parseInt(userId) === createdBy || parseInt(latestRemark?.submittedBy) === parseInt(userId)) { // i remove this one (=== createdBy)
          isVisible = true;
          isEditable = remarks.length === 0; // Creator can edit if no remarks
        }

        // Check remarks for further visibility and editability
        if (remarks.length > 0) {
          latestRemark = remarks.reduce(
            (latest, remark) => {
              return latest.createdAt > remark.createdAt ? latest : remark;
            },
            { createdAt: new Date(0), assignedTo: null }
          );

          console.log("latestRemark", latestRemark)

          // If there is a latest remark, check if the user is the one it's assigned to
          // Determine caseStatus based on assigned user
          if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
            caseStatus = "pending"; // Assigned to current user
            isVisible = true;
            isEditable = true;
          } else if (parseInt(latestRemark.submittedBy) !== parseInt(userId) && parseInt(latestRemark.assignedTo) !== parseInt(userId)) {
            caseStatus = "sent"
            // Hide case if the current user is not involved in the latest remark
            if (parseInt(userId) !== createdBy) { // But still show if the user is the creator
              caseStatus = "sent"
              isVisible = false;
              isEditable = false;
            }
          } else {
            caseStatus = "sent"; // Assigned to another user
            isVisible = true;
            isEditable = false;
          }
          // else {
          // isVisible = false;
          // isEditable = false; // Creator cannot edit once assigned to someone else
          // }
        }

        // Ensuring each case is only added once with the full data structure
        if (isVisible) {
          if (!casesByCaseId[caseData.id]) {
            casesByCaseId[caseData.id] = {
              id: caseData.id,
              fkCaseId: section.fkCaseId,
              caseStatus: caseStatus, // Include caseStatus from CaseNotes
              createdAt: caseData.createdAt,
              createdBy: caseData.createdBy,
              createdByUser: {
                id: createdByUser.id,
                firstName: createdByUser.employee.firstName,
                lastName: createdByUser.employee.lastName,
                designation: createdByUser.employee.designations.designationName,
              },
              isEditable: isEditable,
              fileData: section.cases.files,
              freshReceiptData: section.cases.freshReceipts,
              fileRemarksData: section.cases.casesRemarks,
            };
          }
        }
      });

      // Convert to array and sort by fkCaseId in descending order
      const aggregatedCases = Object.values(casesByCaseId).sort((a, b) => b.fkCaseId - a.fkCaseId);

      const paginatedCases = aggregatedCases.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      );
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

  // Get Case History On The Basis of Created User
  getCasesHistory: async (userId, branchId, currentPage, pageSize) => {
    try {
      const allRelevantSections = await CaseNotes.findAll({
        include: [
          {
            model: Cases,
            as: "cases",
            required: true,
            attributes: [
              "id",
              "fkFileId",
              "isEditable",
              "createdBy",
              "createdAt",
              "updatedAt",
            ],
            // ...(fileId ? { where: { fkFileId: fileId } } : {}),
            include: [
              {
                model: Files,
                as: "files",
                where: { fkBranchId: branchId },
              },
              {
                model: FreshReceipts,
                as: "freshReceipts",
                include: [
                  {
                    model: FreshReceiptAttachments,
                    as: "freshReceiptsAttachments",
                    attributes: ["id", "filename"],
                  },
                ],
              },
              {
                model: Users,
                as: "createdByUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
                        attributes: ["id", "designationName"],
                      },
                    ],
                  },
                ],
              },
              {
                model: FileRemarks,
                as: "casesRemarks",
                separate: true,
                attributes: [
                  "id",
                  "assignedTo",
                  "submittedBy",
                  "fkFileId",
                  "fkCaseId",
                  "comment",
                  "CommentStatus",
                  "createdAt",
                  "updatedAt",
                ],
                include: [
                  {
                    model: Users,
                    as: "submittedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Users,
                    as: "assignedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                ],
                order: [["createdAt", "DESC"]],
              },
            ],
          },
        ],
        attributes: [
          "id",
          "fkCaseId",
          "caseStatus", // Include caseStatus from CaseNotes
          "notingSubject",
          "fkCorrespondenceIds",
          "createdAt",
        ],
        order: [["id", "DESC"]],
      });

      const casesByCaseId = {};
      allRelevantSections.forEach((section) => {
        const caseData = section.cases;
        const remarks = caseData.casesRemarks || [];
        const createdBy = parseInt(caseData.createdBy);
        const createdByUser = caseData.createdByUser;

        // Determine visibility and isEditable
        let isVisible = parseInt(userId) === createdBy;
        let isEditable = true;
        let caseStatus = "draft"; // Default status
        let latestRemark;

        if (remarks.length > 0) {
          latestRemark = remarks.reduce(
            (latest, remark) => {
              return latest.createdAt > remark.createdAt ? latest : remark;
            },
            { createdAt: new Date(0), assignedTo: null }
          );

          // Update visibility and editability based on remarks
          if (parseInt(latestRemark.assignedTo) === parseInt(userId) && section?.dataValues?.caseStatus !== "approved") {
            caseStatus = "pending"; // Assigned to current user
            isVisible = true;
            isEditable = true;
          } else if (parseInt(latestRemark.submittedBy) === parseInt(userId)  && section?.dataValues?.caseStatus !== "approved") {
            caseStatus = "sent";
            isVisible = isVisible || parseInt(createdBy) === parseInt(userId);
            isEditable = false;
          } else {
            caseStatus = section?.dataValues?.caseStatus;
            isVisible = isVisible || parseInt(createdBy) === parseInt(userId);
            isEditable = false;
          }
        }

        if (isVisible) {
          if (!casesByCaseId[caseData.id]) {
            casesByCaseId[caseData.id] = {
              id: caseData.id,
              fkCaseId: section.fkCaseId,
              caseStatus: caseStatus, // Include caseStatus from CaseNotes
              createdAt: caseData.createdAt,
              createdBy: caseData.createdBy,
              createdByUser: {
                id: createdByUser.id,
                firstName: createdByUser.employee.firstName,
                lastName: createdByUser.employee.lastName,
                designation: createdByUser.employee.designations.designationName,
              },
              isEditable: isEditable,
              fileData: section.cases.files,
              freshReceiptData: section.cases.freshReceipts,
              fileRemarksData: section.cases.casesRemarks,
            };
          }
        }
      });

      const aggregatedCases = Object.values(casesByCaseId);
      const paginatedCases = aggregatedCases.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      );
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


  getAllCasesHistory: async (
    // fileId,
    userId,
    branchId,
    currentPage,
    pageSize
  ) => {
    try {
      const allRelevantSections = await CaseNotes.findAll({
        include: [
          {
            model: Cases,
            as: "cases",
            required: true,
            attributes: [
              "id",
              "fkFileId",
              "isEditable",
              "createdBy",
              "createdAt",
              "updatedAt",
            ],
            // ...(fileId ? { where: { fkFileId: fileId } } : {}),
            include: [
              {
                model: Files,
                as: "files",
                where: { fkBranchId: branchId },
              },
              {
                model: FreshReceipts,
                as: "freshReceipts",
                include: [
                  {
                    model: FreshReceiptAttachments,
                    as: "freshReceiptsAttachments",
                    attributes: ["id", "filename"],
                  },
                ],
              },
              {
                model: Users,
                as: "createdByUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
                        attributes: ["id", "designationName"],
                      },
                    ],
                  },
                ],
              },
              {
                model: FileRemarks,
                as: "casesRemarks",
                separate: true,
                attributes: [
                  "id",
                  "assignedTo",
                  "submittedBy",
                  "fkFileId",
                  "fkCaseId",
                  "comment",
                  "CommentStatus",
                  "createdAt",
                  "updatedAt",
                ],
                include: [
                  {
                    model: Users,
                    as: "submittedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Users,
                    as: "assignedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                ],
                order: [["createdAt", "DESC"]],
              },
            ],
          },
        ],
        attributes: [
          "id",
          "fkCaseId",
          "caseStatus", // Include caseStatus from CaseNotes
          "notingSubject",
          "fkCorrespondenceIds",
          "createdAt",
        ],
        order: [["id", "DESC"]],
      });

      const casesByCaseId = {};
      let latestRemark;
      allRelevantSections.forEach((section) => {
        const caseData = section.cases;
        const remarks = caseData.casesRemarks || [];
        const createdByUser = caseData.createdByUser;


        // Determine the case status based on the assigned user
        let status = "draft";
        if (remarks.length > 0) {
          latestRemark = remarks.reduce(
            (latest, remark) =>
              latest.createdAt > remark.createdAt ? latest : remark,
            { createdAt: new Date(0), assignedTo: null }
          );

          if (parseInt(latestRemark.assignedTo) === parseInt(userId) && section?.dataValues?.caseStatus !== "approved") {
            status = "pending";
          } else if (parseInt(latestRemark.submittedBy) === parseInt(userId)  && section?.dataValues?.caseStatus !== "approved") {
            status = "sent";
            // isVisible = isVisible || parseInt(createdBy) === parseInt(userId);
            isEditable = false;
          }
          else {
            status = section?.dataValues?.caseStatus;
          }
        }

        if (!casesByCaseId[caseData.id]) {
          casesByCaseId[caseData.id] = {
            id: caseData.id,
            fkCaseId: section.fkCaseId,
            caseStatus: status, // Include caseStatus from CaseNotes
            createdAt: caseData.createdAt,
            createdBy: caseData.createdBy,
            createdByUser: {
              id: createdByUser.id,
              firstName: createdByUser.employee.firstName,
              lastName: createdByUser.employee.lastName,
              designation: createdByUser.employee.designations.designationName,
            },
            fileData: section.cases.files,
            freshReceiptData: section.cases.freshReceipts,
            fileRemarksData: section.cases.casesRemarks,
          };
        }
      });

      const aggregatedCases = Object.values(casesByCaseId);
      const paginatedCases = aggregatedCases.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      );
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

  // getPendingCases API
  getPendingCases: async (userId, branchId, currentPage, pageSize, fileId = null) => {
    try {
      const allPendingSections = await CaseNotes.findAll({
        include: [
          {
            model: Cases,
            as: "cases",
            required: true,
            attributes: [
              "id",
              "fkFileId",
              "isEditable",
              "createdBy",
              "createdAt",
              "updatedAt",
            ],
            // Conditionally apply the where clause if fileId is provided
            ...(fileId ? { where: { fkFileId: fileId } } : {}),
            include: [
              {
                model: Files,
                as: "files",
              },
              {
                model: FreshReceipts,
                as: "freshReceipts",
                include: [
                  {
                    model: FreshReceiptAttachments,
                    as: "freshReceiptsAttachments",
                    attributes: ["id", "filename"],
                  },
                ],
              },
              {
                model: Users,
                as: "createdByUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
                        attributes: ["id", "designationName"],
                      },
                    ],
                  },
                ],
              },
              {
                model: FileRemarks,
                as: "casesRemarks",
                separate: true,
                attributes: [
                  "id",
                  "assignedTo",
                  "submittedBy",
                  "fkFileId",
                  "fkCaseId",
                  "comment",
                  "priority",
                  "CommentStatus",
                  "createdAt",
                  "updatedAt",
                ],
                include: [
                  {
                    model: Users,
                    as: "submittedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Users,
                    as: "assignedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                ],
                order: [["createdAt", "DESC"]],
              },
            ],
          },
        ],
        attributes: [
          "id",
          "fkCaseId",
          "caseStatus",
          "notingSubject",
          "fkCorrespondenceIds",
          "createdAt",
        ],
        order: [["id", "DESC"]],
      });

      const pendingCasesByCaseId = {};
      allPendingSections.forEach((section) => {
        const caseData = section.cases;
        const remarks = caseData.casesRemarks || [];
        const createdBy = parseInt(caseData.createdBy);
        const createdByUser = caseData.createdByUser;

        let isVisible = false;
        let isEditable = true;
        let caseStatus = "draft"; // Default status
        let latestRemark;

        // Initial visibility and editability logic
        if (parseInt(userId) === createdBy || parseInt(latestRemark?.submittedBy) === parseInt(userId)) {
          isVisible = true;
          isEditable = remarks.length === 0;
        }

        if (remarks.length > 0) {
          latestRemark = remarks.reduce(
            (latest, remark) => latest.createdAt > remark.createdAt ? latest : remark,
            { createdAt: new Date(0), assignedTo: null }
          );

          if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
            caseStatus = "pending";
            isVisible = true;
            isEditable = true;
          } else if (parseInt(latestRemark.submittedBy) !== parseInt(userId) && parseInt(latestRemark.assignedTo) !== parseInt(userId)) {
            caseStatus = "sent";
            if (parseInt(userId) !== createdBy) {
              isVisible = false;
              isEditable = false;
            }
          } else {
            caseStatus = "sent";
            isVisible = true;
            isEditable = false;
          }
        }

        // Add only if the case is pending and visible
        if (caseStatus === "pending" && isVisible && section.dataValues.caseStatus !== "approved") {
          if (!pendingCasesByCaseId[caseData.id]) {
            pendingCasesByCaseId[caseData.id] = {
              id: caseData.id,
              fkCaseId: section.fkCaseId,
              caseStatus: caseStatus,
              createdAt: caseData.createdAt,
              createdBy: caseData.createdBy,
              createdByUser: {
                id: createdByUser.id,
                firstName: createdByUser.employee.firstName,
                lastName: createdByUser.employee.lastName,
                designation: createdByUser.employee.designations.designationName,
              },
              isEditable: isEditable,
              fileData: section.cases.files,
              freshReceiptData: section.cases.freshReceipts,
              fileRemarksData: section.cases.casesRemarks,
            };
          }
        }
      });

      const aggregatedPendingCases = Object.values(pendingCasesByCaseId);
      const paginatedPendingCases = aggregatedPendingCases.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      );
      const totalPages = Math.ceil(aggregatedPendingCases.length / pageSize);

      return {
        cases: paginatedPendingCases,
        count: aggregatedPendingCases.length,
        totalPages,
      };
    } catch (error) {
      throw new Error(error.message || "Error Fetching Pending Cases");
    }
  },



  // Get Approved Case Hitory
  getApprovedCasesHistory: async (
    fileId,
    userId,
    branchId,
    currentPage,
    pageSize
  ) => {
    try {
      const allRelevantSections = await CaseNotes.findAll({
        where: { caseStatus: "approved", fkBranchId: branchId },
        include: [
          {
            model: Cases,
            as: "cases",
            required: true,
            attributes: [
              "id",
              "fkFileId",
              "isEditable",
              "createdBy",
              "createdAt",
              "updatedAt",
            ],
            ...(fileId ? { where: { fkFileId: fileId } } : {}),
            include: [
              {
                model: Files,
                as: "files",
                where: { fkBranchId: branchId },
              },
              {
                model: FreshReceipts,
                as: "freshReceipts",
                include: [
                  {
                    model: FreshReceiptAttachments,
                    as: "freshReceiptsAttachments",
                    attributes: ["id", "filename"],
                  },
                ],
              },
              {
                model: Users,
                as: "createdByUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
                        attributes: ["id", "designationName"],
                      },
                    ],
                  },
                ],
              },
              {
                model: FileRemarks,
                as: "casesRemarks",
                separate: true,
                attributes: [
                  "id",
                  "assignedTo",
                  "submittedBy",
                  "fkFileId",
                  "fkCaseId",
                  "comment",
                  "CommentStatus",
                  "createdAt",
                  "updatedAt",
                ],
                include: [
                  {
                    model: Users,
                    as: "submittedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Users,
                    as: "assignedUser",
                    attributes: ["id"],
                    include: [
                      {
                        model: Employees,
                        as: "employee",
                        attributes: ["id", "firstName", "lastName"],
                        include: [
                          {
                            model: Designations,
                            as: "designations",
                            attributes: ["id", "designationName"],
                          },
                        ],
                      },
                    ],
                  },
                ],
                order: [["createdAt", "DESC"]],
              },
            ],
          },
        ],
        attributes: [
          "id",
          "fkCaseId",
          "caseStatus", // Include caseStatus from CaseNotes
          "notingSubject",
          "fkCorrespondenceIds",
          "createdAt",
        ],
        order: [["id", "DESC"]],
      });

      const casesByCaseId = {};
      allRelevantSections.forEach((section) => {
        const caseData = section.cases;
        const createdByUser = caseData.createdByUser;
        if (userId) {
          const remarks = caseData.casesRemarks || [];
          const createdBy = parseInt(caseData.createdBy);


          // Determine visibility and isEditable
          let isVisible = false;
          let isEditable = true;

          // Initial visibility is only for the creator
          if (parseInt(userId) === createdBy) {
            isVisible = true;
            isEditable = remarks.length === 0; // Creator can edit if no remarks
          }

          // Check remarks for further visibility and editability
          if (remarks.length > 0) {
            const latestRemark = remarks.reduce(
              (latest, remark) => {
                return latest.createdAt > remark.createdAt ? latest : remark;
              },
              { createdAt: new Date(0), assignedTo: null }
            );

            // If there is a latest remark, check if the user is the one it's assigned to
            if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
              isVisible = false; // The assigned user cannot show the case
              isEditable = true; // The assigned user can edit the case
            } else {
              // Ensure the creator retains visibility even when not the latest assigned
              isVisible = isVisible || parseInt(createdBy) === parseInt(userId);
              isEditable = false; // Creator cannot edit once assigned to someone else
            }
          }

          // Ensuring each case is only added once with the full data structure
          if (isVisible) {
            if (!casesByCaseId[caseData.id]) {
              casesByCaseId[caseData.id] = {
                id: caseData.id,
                fkCaseId: section.fkCaseId,
                caseStatus: section.caseStatus, // Include caseStatus from CaseNotes
                createdAt: caseData.createdAt,
                createdBy: caseData.createdBy,
                fileData: caseData.files,
                freshReceiptData: caseData.freshReceipts,
                fileRemarksData: caseData.casesRemarks,
              };
            }
          }
        } else {
          casesByCaseId[caseData.id] = {
            id: caseData.id,
            fkCaseId: section.fkCaseId,
            caseStatus: section.caseStatus, // Include caseStatus from CaseNotes
            createdAt: caseData.createdAt,
            createdBy: caseData.createdBy,
            createdByUser: {
              id: createdByUser.id,
              firstName: createdByUser.employee.firstName,
              lastName: createdByUser.employee.lastName,
              designation: createdByUser.employee.designations.designationName,
            },
            fileData: caseData.files,
            freshReceiptData: caseData.freshReceipts,
            fileRemarksData: caseData.casesRemarks,
          };
        }
      });

      const aggregatedCases = Object.values(casesByCaseId);
      const paginatedCases = aggregatedCases.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      );
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
        where: { id: caseId, fkFileId: fileId },
        attributes: ["id", "isEditable"],
      });
      const caseIds = caseFile.map((caseId) => caseId.id);
      const result = await SectionCases.findAll({
        raw: false,
        where: {
          fkCaseId: caseIds,
        },
        include: [
          {
            model: CaseAttachments,
            as: "caseAttachments",
            attributes: ["id", "fileName"],
          },
        ],
        attributes: ["id", "fkCaseId", "sectionType", "description"],
      });

      const casesByCaseId = {};
      result.forEach((section) => {
        const { fkCaseId, sectionType, description, caseAttachments } = section;
        if (!casesByCaseId[fkCaseId]) {
          casesByCaseId[fkCaseId] = { fkCaseId };
        }
        const caseItem = caseFile.find((item) => item.id === fkCaseId);
        const isEditable = caseItem ? caseItem.isEditable : null;
        casesByCaseId[fkCaseId][sectionType] = {
          description,
          caseAttachments,
          isEditable,
        };
      });
      const cases = Object.values(casesByCaseId);

      return cases;
    } catch (error) {
      console.error("Error Fetching Case:", error.message);
    }
  },
  
  updateCase: async (data, caseNotesId) => {
    const transaction = await db.sequelize.transaction();

  //  console.log('Requested Data ', data); return false;
    try {
      // Update existing case notes
      const caseNotes = await CaseNotes.update(
        {
          notingSubject: data.notingSubject,
        },
        {
          where: { id: caseNotesId },
          transaction,
        }
      );

      let paragraphArray = data.paragraphArray;
      if (typeof paragraphArray === "string") {
        try {
          paragraphArray = JSON.parse(paragraphArray);
        } catch (error) {
          throw new Error("Invalid format for paragraphArray");
        }
      }

      console.log("case note id", caseNotesId);
      console.log("Data object:", data); // Log the entire data object to inspect its structure

      // Destroy all existing paragraphs only once
      await NoteParagraphs.destroy({
        where: { fkCaseNoteId: caseNotesId },
        transaction,
      });

  
      console.log("paragraphArray.length", paragraphArray.length);

      // Preprocess paragraphArray to check for duplicate flags
      const flagTracker = new Set();

      for (const para of paragraphArray) {
        for (const ref of para.references) {
          const validFlag = await db.flags.findOne({ where: { id: ref.flagId } });

          if (flagTracker.has(ref.flagId)) {
            throw new Error(
              `The flag '${validFlag.flag}' is already assigned to '${para.title}'`
            );
          }

          flagTracker.add(ref.flagId);
        }
      }


      let allCorrespondencesIds = new Array(paragraphArray.length).fill(null);
      let allFreshReceiptIds = new Array(paragraphArray.length).fill(null);
      
      if (Array.isArray(paragraphArray) && paragraphArray.length > 0) {
        await Promise.all(
          paragraphArray.map(async (para, index) => {
            let correspondencesIds = [];
            let freshReceiptIds = [];
            let flagIds = [];
  
            para.references.forEach((ref) => {
              flagIds.push(ref.id); // Store flag id
  
              if (ref.attachments && Array.isArray(ref.attachments)) {
                ref.attachments.forEach((att) => {
                  if (att.name) {
                    correspondencesIds.push(ref.id); // Correspondence ID
                  } else if (att.filename) {
                    freshReceiptIds.push(ref.id); // FreshReceipt ID
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
  
             const validFlag = await db.flags.findOne({ where: { id: para.references[0].flagId } });

            if (!validFlag) {
              throw new Error(`Flag with id ${para.references[0].flag} does not exist`);
            }
            
            // console.log('correspondencesIds in update',correspondencesIds); return false;
            await NoteParagraphs.create(
              {
                fkCaseNoteId: caseNotesId,
                paragraphTitle: para.title,
                paragraph: para.description,
                createdBy: para.createdBy,
                flags: validFlag.flag, // Save all flags as string
                fkFlagId: validFlag.id, // Use the valid flag ID
                fkCorrespondenceId: correspondencesIds[0] || null, // Save correspondence ID
              },
              { transaction }
            );
            
          })
        );
  
          await CaseNotes.update(
          {
            fkCorrespondenceIds: allCorrespondencesIds,
            fkFreshReciptIds: allFreshReceiptIds,
          },
          { where: { id: caseNotesId }, transaction }
        );
      }

      await transaction.commit();
      return caseNotes;
    } catch (error) {
      await transaction.rollback();
      console.error("Error Updating Case", error);
      throw new Error(error.message || "Error Updating Case");
    }
  },


  updateCaseStatus: async (caseId, newStatus) => {
    try {
      // Update status to 'approved'
      const caseNoteData = await CaseNotes.update(
        { caseStatus: newStatus },
        { where: { fkCaseId: caseId } }
      );
      console.log(caseNoteData);
      return {
        message: "Case status updated successfully.",
        data: caseNoteData,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message || "Error updating case status");
    }
  },

  // Assign Case
  assignCase: async (fileId, caseId, files, req) => {
    try {
      const sharedDesignations = [
        "Superintendent",
        "IT Assistant",
        "Sub Assistant",
        "Junior Assistant",
      ];

      // Retrieve the employee details for the user who is submitting the case
      const employee = await Employees.findOne({
        where: { fkUserId: req.submittedBy },
        attributes: ["id", "fkBranchId", "fkDesignationId", "userType"],
        include: [
          {
            model: Designations,
            as: "designations",
            attributes: ["id", "designationName"],
          },
        ],
      });

      const { fkBranchId, userType, designations } = employee;
      //  const sharesDiaryNumber = sharedDesignations.includes(designations.designationName);

      // const sharesDiaryNumber =
      let newDiaryNumber;

      if (userType === "Section User") {
        const usersWithSharedDesignations = await Employees.findAll({
          where: {
            fkBranchId: fkBranchId,
            userType: "Section User",
          },
          attributes: ["fkUserId"],
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: ["id", "designationName"],
            },
          ],
        });
        const userIds = usersWithSharedDesignations.map(
          (user) => user.fkUserId
        );
        let maxDiaryNumber = await FileUserDiares.max("diaryNumber", {
          where: {
            fkFileId: fileId,
            fkCaseId: caseId,
            fkSubmittedByUserId: {
              [Op.in]: userIds,
            },
          },
        });

        if (isNaN(maxDiaryNumber)) {
          maxDiaryNumber = 1;
        }
        newDiaryNumber = maxDiaryNumber !== null ? parseInt(maxDiaryNumber) : 1;
      } else if (userType === "Officer") {
        // Find all userIds with sharedDesignations
        const userIdsWithSharedDesignations = await Employees.findAll({
          where: { userType: "Officer" },
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: [],
            },
          ],
          attributes: ["fkUserId"],
        }).then((users) => users.map((user) => user.fkUserId));

        // Find the max diaryNumber, excluding userIds with sharedDesignations
        let maxDiaryNumber = await FileUserDiares.max("diaryNumber", {
          where: {
            fkFileId: fileId,
            fkCaseId: caseId,
            fkSubmittedByUserId: {
              [db.Sequelize.Op.notIn]: userIdsWithSharedDesignations,
            },
          },
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
        priority: req.priority,
        CommentStatus: req.CommentStatus ? req.CommentStatus : null,
        comment: req.comment ? req.comment : null,
      });

      // Create the fileDiary with the new diaryNumber for the submitting user
      await FileUserDiares.create({
        fkFileId: fileId,
        fkCaseId: caseId,
        fkSubmittedByUserId: req.submittedBy,
        diaryNumber: newDiaryNumber,
      });

      await FileNotifications.create({
        fkUserId: req.assignedTo,
        readStatus: false,
        fkFileId: fileId,
        fkCaseId: caseId,
      });

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
            as: "users",
            attributes: ["id"],
            include: [
              {
                model: Employees,
                as: "employee",
                attributes: ["id", "firstName", "lastName"],
                include: [
                  {
                    model: Designations,
                    as: "designations",
                    attributes: ["id", "designationName"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 1,
      });

      return signature;
    } catch (error) {
      console.error("Error Fetching Case:", error.message);
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
  // getSingleCaseDetails: async (fileId, caseId) => {
  //   try {
  //     const caseNotes = await CaseNotes.findOne({
  //       where: {
  //         fkFileId: fileId,
  //         fkCaseId: caseId,
  //       },
  //       attributes: [
  //         "id",
  //         "fkBranchId",
  //         "notingSubject",
  //         "fkCorrespondenceIds",
  //         "fkFreshReciptIds",
  //       ],
  //     });

  //     if (!caseNotes) {
  //       return {};
  //     }

  //     const cases = await Cases.findOne({
  //       where: { id: caseId, fkFileId: fileId },
  //       attributes: ["id", "isEditable"],
  //       include: [
  //         {
  //           model: Files,
  //           as: "files",
  //         },
  //         {
  //           model: FreshReceipts,
  //           as: "freshReceipts",
  //           include: [
  //             {
  //               model: FreshReceiptAttachments,
  //               as: "freshReceiptsAttachments",
  //               attributes: ["id", "filename"],
  //             },
  //           ],
  //         },
  //         {
  //           model: FileRemarks,
  //           as: "casesRemarks",
  //           separate: true,
  //           order: [["id", "DESC"]],
  //           attributes: [
  //             "id",
  //             "assignedTo",
  //             "submittedBy",
  //             "fkFileId",
  //             "fkCaseId",
  //             "comment",
  //             "CommentStatus",
  //             "createdAt",
  //             "updatedAt",
  //           ],
  //           include: [
  //             {
  //               model: Users,
  //               as: "submittedUser",
  //               attributes: ["id"],
  //               include: [
  //                 {
  //                   model: Employees,
  //                   as: "employee",
  //                   attributes: ["id", "firstName", "lastName", "userType"],
  //                   include: [
  //                     {
  //                       model: Designations,
  //                       as: "designations",
  //                       attributes: ["id", "designationName"],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //             {
  //               model: Users,
  //               as: "assignedUser",
  //               attributes: ["id"],
  //               include: [
  //                 {
  //                   model: Employees,
  //                   as: "employee",
  //                   attributes: ["id", "firstName", "lastName", "userType"],
  //                   include: [
  //                     {
  //                       model: Designations,
  //                       as: "designations",
  //                       attributes: ["id", "designationName"],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         {
  //           model: FileUserDiares,
  //           as: "fileDiary",
  //           include: [
  //             {
  //               model: Users,
  //               as: "submittedByUser",
  //               attributes: ["id"],
  //               include: [
  //                 {
  //                   model: Employees,
  //                   as: "employee",
  //                   attributes: ["id", "firstName", "lastName"],
  //                   include: [
  //                     {
  //                       model: Departments,
  //                       as: "departments",
  //                       attributes: ["id", "departmentName"],
  //                     },
  //                     {
  //                       model: Branches,
  //                       as: "branches",
  //                       attributes: ["id", "branchName"],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       ],
  //     });

  //     const noteParas = await NoteParagraphs.findAll({
  //       where: { fkCaseNoteId: caseNotes.id },
  //       attributes: ["paragraphTitle", "paragraph", "flags", "createdBy"],
  //       order: [["createdAt", "ASC"]],
  //       include: [
  //         {
  //           model: Users,
  //           as: "createdByUser",
  //           attributes: ["id"],
  //           include: [
  //             {
  //               model: Employees,
  //               as: "employee",
  //               attributes: ["id", "firstName", "lastName", "userType"],
  //             },
  //           ],
  //         },
  //       ],
  //     });

  //     const validCorrespondenceIds = caseNotes.fkCorrespondenceIds;
  //     console.log("validCorrespondenceIds", validCorrespondenceIds);
  //     const correspondences = await Correspondences.findAll({
  //       where: { id: { [Op.in]: validCorrespondenceIds } },
  //       include: [
  //         {
  //           model: CorrespondenceAttachments,
  //           as: "correspondenceAttachments",
  //           attributes: ["id", "file"],
  //         },
  //       ],
  //     });

  //     const validFreshReceiptIds = caseNotes.fkFreshReciptIds;
  //     console.log("validFreshReceiptIds", validFreshReceiptIds);
  //     const freshReceipts = await FreshReceipts.findAll({
  //       where: { id: { [Op.in]: validFreshReceiptIds } },
  //       include: [
  //         {
  //           model: FreshReceiptAttachments,
  //           as: "freshReceiptsAttachments",
  //           attributes: ["id", "filename"],
  //         },
  //       ],
  //     });

  //     let correspondenceMap = {};
  //     correspondences.forEach((corr) => {
  //       correspondenceMap[corr.id] = {
  //         id: corr.id,
  //         name: corr.name,
  //         description: corr.description,
  //         attachments: corr.correspondenceAttachments.map((att) => ({
  //           id: att.id,
  //           file: att.file,
  //         })),
  //       };
  //     });

  //     console.log("correspondenceMap---", correspondenceMap);

  //     let freshReceiptMap = {};
  //     freshReceipts.forEach((fresh) => {
  //       freshReceiptMap[fresh.id] = {
  //         id: fresh.id,
  //         attachments: fresh.freshReceiptsAttachments.map((att) => ({
  //           id: att.id,
  //           filename: att.filename,
  //         })),
  //       };
  //     });

  //     console.log("freshReceiptMap---", freshReceiptMap);

  //     // Create a map to associate flags with their IDs
  //     const flagIdMap = {};
  //     let flagIdMapC = {};
  //     let flagIdMapF = {};

  //     noteParas.forEach((para, index) => {
  //       const flags = para.flags ? para.flags.split(",") : [];
  //       console.log("flags", flags);

  //       flags.forEach((flag) => {
  //         console.log(
  //           "validCorrespondenceIds[index]",
  //           validCorrespondenceIds[index],
  //           index
  //         );
  //         console.log(
  //           "validFreshReceiptIds[index]",
  //           validFreshReceiptIds[index],
  //           index
  //         );
  //         const correspondenceId = validCorrespondenceIds[index];
  //         const freshReceiptId = validFreshReceiptIds[index];

  //         console.log("correspondenceId", correspondenceId);
  //         console.log("freshReceiptId", freshReceiptId);

  //         console.log("flags", flag);
  //         console.log("flags", flag.trim());

  //         if (correspondenceId !== null) {
  //           flagIdMap[flag.trim()] = correspondenceId;

  //           console.log(
  //             "flagIdMap[flag.trim()]-- Correspondenc",
  //             flagIdMap[flag.trim()]
  //           );
  //         }
  //         if (freshReceiptId !== null) {
  //           flagIdMap[flag.trim()] = freshReceiptId;
  //           console.log("flagIdMap[flag.trim()]-- FR", flagIdMap[flag.trim()]);
  //         }
  //       });
  //     });

  //     console.log("ccccccc", flagIdMap);
  //     const paragraphArray = noteParas.map((para, index) => {
  //       const flags = para.flags ? para.flags.split(",") : [];
  //       let references = [];

  //       flags.forEach((flag) => {
  //         const reference = {
  //           flag: flag.trim(),
  //           id: flagIdMap[flag.trim()],
  //           attachments: [],
  //         };
  //         console.log("flagIdMap", flagIdMap);

  //         const correspondenceId = flagIdMap[flag.trim()];
  //         const freshReceiptsId = flagIdMap[flag.trim()];

  //         console.log("correspondenceId", correspondenceId);
  //         console.log("freshReceiptsId", freshReceiptsId);

  //         console.log(
  //           "correspondenceMap[correspondenceId]----",
  //           correspondenceMap[correspondenceId]
  //         );
  //         if (correspondenceId && correspondenceMap[correspondenceId]) {
  //           const correspondenceAttachment = correspondenceMap[
  //             correspondenceId
  //           ].attachments.map((att) => ({
  //             id: att.id,
  //             file: att.file,
  //           }));
  //           reference.attachments.push({
  //             id: correspondenceMap[correspondenceId].id,
  //             name: correspondenceMap[correspondenceId].name,
  //             description: correspondenceMap[correspondenceId].description,
  //             attachments: correspondenceAttachment,
  //           });

  //           console.log("reference C------", reference);
  //           return false;
  //         } else if (freshReceiptsId && freshReceiptMap[freshReceiptsId]) {
  //           const freshReceiptAttachments = freshReceiptMap[
  //             freshReceiptsId
  //           ].attachments.map((att) => ({
  //             id: att.id,
  //             filename: att.filename,
  //           }));
  //           console.log("reference F------", reference);
  //           reference.attachments.push(...freshReceiptAttachments);
  //         }
  //         console.log("references before----", references);
  //         references.push(reference);
  //         console.log("references after----", references);
  //       });

  //       return {
  //         title: para.paragraphTitle,
  //         description: para.paragraph,
  //         references: references,
  //         // createdByUser: para.createdByUser,
  //         createdBy: para.createdBy,
  //       };
  //     });

  //     // Filter unique paragraphs (if necessary)
  //     const uniqueParagraphArray = paragraphArray.filter(
  //       (para, index, self) =>
  //         index ===
  //         self.findIndex(
  //           (p) => p.title === para.title && p.description === para.description
  //         )
  //     );

  //     // Construct the response
  //     const response = {
  //       cases: cases,
  //       caseNoteId: caseNotes.id,
  //       fkBranchId: caseNotes.fkBranchId,
  //       notingSubject: caseNotes.notingSubject,
  //       paragraphArray: uniqueParagraphArray,
  //     };

  //     return response;
  //   } catch (error) {
  //     console.error("Error Fetching Case Details", error);
  //     throw new Error(error.message || "Error Fetching Case Details");
  //   }
  // },

  getSingleCaseDetails: async (fileId, caseId, orderBy = 'DESC') => {
    try {
      const caseNotes = await CaseNotes.findOne({
        where: {
          fkFileId: fileId,
          fkCaseId: caseId,
        },
        attributes: [
          "id",
          "fkBranchId",
          "notingSubject",
          "fkCorrespondenceIds",
          "fkFreshReciptIds",
        ],
      });
  
      if (!caseNotes) {
        return {};
      }
  
      const cases = await Cases.findOne({
        where: { id: caseId, fkFileId: fileId },
        attributes: ["id", "isEditable","createdAt"],
        include: [
          {
            model: Files,
            as: "files",
          },
          {
            model: FreshReceipts,
            as: "freshReceipts",
            include: [
              {
                model: FreshReceiptAttachments,
                as: "freshReceiptsAttachments",
                attributes: ["id", "filename"],
              },
            ],
          },
          {
            model: FileRemarks,
            as: "casesRemarks",
            separate: true,
            order: [["id", "DESC"]],
            attributes: [
              "id",
              "assignedTo",
              "submittedBy",
              "fkFileId",
              "fkCaseId",
              "comment",
              "CommentStatus",
              "createdAt",
              "updatedAt",
            ],
            include: [
              {
                model: Users,
                as: "submittedUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName", "userType"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
                        attributes: ["id", "designationName"],
                      },
                    ],
                  },
                ],
              },
              {
                model: Users,
                as: "assignedUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName", "userType"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
                        attributes: ["id", "designationName"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: FileUserDiares,
            as: "fileDiary",
            include: [
              {
                model: Users,
                as: "submittedByUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employees,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                    include: [
                      {
                        model: Departments,
                        as: "departments",
                        attributes: ["id", "departmentName"],
                      },
                      {
                        model: Branches,
                        as: "branches",
                        attributes: ["id", "branchName"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
  
      const noteParas = await NoteParagraphs.findAll({
        where: { fkCaseNoteId: caseNotes.id },
        attributes: ["id", "paragraphTitle", "paragraph", "flags", "createdBy","createdAt"],
        order: [["id", orderBy]],
        include: [
          {
            model: Users,
            as: "createdByUser",
            attributes: ["id"],
            include: [
              {
                model: Employees,
                as: "employee",
                attributes: ["id", "firstName", "lastName", "userType"],
                include: [
                  {
                    model: Designations,
                    as: "designations",
                    attributes: ["id", "designationName"],
                  },
                ],
              },
            ],
          },
          {
            model: db.flags,
            as: "flag",
            attributes: ["id", "flag"],
          },
          {
            model: db.correspondences,
            as: "correspondence",
            attributes: ["id", "name", 'fkCaseId', 'fkFileId', 'fkBranchId' ,'description'],
            include: [
              {
                model: db.correspondenceAttachments,
                as: "correspondenceAttachments",
                attributes: ["id", "file"],
              },
            ],
          },
        ],
      });
  
      // Handle FreshReceipts and their attachments
      const validFreshReceiptIds = caseNotes.fkFreshReciptIds || [];
      let freshReceiptMap = {};
  
      if (validFreshReceiptIds.length > 0) {
        const freshReceipts = await FreshReceipts.findAll({
          where: { id: { [Op.in]: validFreshReceiptIds } },
          include: [
            {
              model: FreshReceiptAttachments,
              as: "freshReceiptsAttachments",
              attributes: ["id", "filename"],
            },
          ],
        });
  
        freshReceipts.forEach((fresh) => {
          freshReceiptMap[fresh.id] = {
            id: fresh.id,
            attachments: fresh.freshReceiptsAttachments.map((att) => ({
              id: att.id,
              filename: att.filename,
            })),
          };
        });
      }
  
      const paragraphArray = noteParas.map((para) => {
        const paraFlag = para.flag; // Get the flag for the paragraph
        const correspondence = para.correspondence; // Get the correspondence for the paragraph
        let references = [];
  
        // Prepare reference structure for both freshReceipts and correspondence
        if (paraFlag) {
          const reference = {
            flagId: paraFlag.id,
            flag: paraFlag.flag,
            id: correspondence.id,  // Include correspondence.id directly in the reference object
            attachments: [],
          };
  
          // Handle FreshReceipts if available
          if (validFreshReceiptIds.length > 0 && freshReceiptMap[para.id]) {
            reference.attachments.push(...freshReceiptMap[para.id].attachments);
          } else if (correspondence) {
            
            // Handle Correspondence if no fresh receipts
            reference.attachments.push({
              id: correspondence.id,
              name: correspondence.name,
              fkCaseId: correspondence.fkCaseId,
              fkFileId: correspondence.fkFileId,
              fkBranchId: correspondence.fkBranchId,
              description: correspondence.description,
              attachments: correspondence.correspondenceAttachments.map((attachment) => ({
                id: attachment.id,
                file: attachment.file,
              })),
            });
          }
  
          references.push(reference);
        }
  
        // Return structured paragraph object
        return {
          id: para.id,
          title: para.paragraphTitle,
          description: para.paragraph,
          references: references,
          createdAt: para.createdAt,
          createdBy: para.createdBy,
          createdByUser: `${para.createdByUser.employee.firstName} ${para.createdByUser.employee.lastName}`,
          createdByUserDesignation: `${para.createdByUser.employee.designations.designationName}`,
          // assignedToUserDesignation: `${cases.casesRemarks.assignedUser.designations.designationName}`,
          isSave: true,
        };
      });
  
      // Construct the response
      const response = {
        cases: cases,
        caseNoteId: caseNotes.id,
        fkBranchId: caseNotes.fkBranchId,
        notingSubject: caseNotes.notingSubject,
        paragraphArray: paragraphArray,
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
        include: [
          {
            model: Employees,
            as: "employee",
            include: [
              {
                model: Branches,
                as: "branches",
                attributes: ["id", "branchName"],
              },
            ],
          },
        ],
      });

      const userBranchId = userWithBranch.employee.branches.id;
      const userBranchName = userWithBranch.employee.branches.branchName;

      const specialBranches = [
        "Notice Office",
        "Question",
        "Motion",
        "Resolution",
      ];
      let employees;
      let branchHierarchy;

      const branchHierarchyConfig = await BranchHierarchy.findOne({
        where: { branchName: userBranchName },
      });
      branchHierarchy = branchHierarchyConfig.branchHierarchy;

      if (specialBranches.includes(userBranchName)) {
        const noticeOfficeBranchId = await Branches.findOne({
          where: { branchName: "Notice Office" },
          attributes: ["id"],
        }).then((branch) => branch.id);

        const noticeOfficeHierarchy = [
          "Chairman",
          "Secretary",
          "Special Secretary",
          "Joint Secretary",
          "Deputy Secretary",
          "Section Officer",
        ];
        const noticeOfficeEmployees = await Employees.findAll({
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: ["designationName"],
              where: { designationName: { [Op.in]: noticeOfficeHierarchy } },
            },
          ],
          where: { fkBranchId: noticeOfficeBranchId },
        });

        const userBranchSuperintendent = await Employees.findAll({
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: ["designationName"],
              where: { designationName: { [Op.in]: branchHierarchy } },
            },
          ],
          where: { fkBranchId: userBranchId },
        });

        employees = [...noticeOfficeEmployees, ...userBranchSuperintendent];
      } else {
        employees = await Employees.findAll({
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: ["id", "designationName"],
              where: { designationName: { [Op.in]: branchHierarchy } },
            },
          ],
          where: { fkBranchId: userBranchId },
        });
      }

      // Sort employees based on the branch hierarchy
      const designationMap = branchHierarchy.reduce(
        (acc, designation, index) => {
          acc[designation] = index;
          return acc;
        },
        {}
      );

      // Sort employees based on their mapped positions in the hierarchy
      employees.sort((a, b) => {
        const designationA = a.designations.designationName;
        const designationB = b.designations.designationName;
        return designationMap[designationA] - designationMap[designationB];
      });

      return employees;
    } catch (error) {
      console.error("Error Fetching Designations:", error.message);
      throw new Error("Error Fetching Designations");
    }
  },

  // Get Employees on Higher Level By User's Login
  getHigherLevelDesignations: async (userId) => {
    try {
      // Find the user and their branch
      const userWithBranch = await Users.findOne({
        where: { id: userId },
        include: [
          {
            model: Employees,
            as: "employee",
            include: [
              {
                model: Branches,
                as: "branches",
                attributes: ["id", "branchName"],
              },
            ],
          },
        ],
      });

      const userBranchId = userWithBranch.employee.branches.id;
      const userBranchName = userWithBranch.employee.branches.branchName;

      const specialBranches = [
        "Notice Office",
        "Question",
        "Motion",
        "Resolution",
      ];
      let employees;
      let branchHierarchy;
      let highLevelDesignations = [];
      let lowLevelDesignations = [];

      if (specialBranches.includes(userBranchName)) {
        const noticeOfficeBranchId = await Branches.findOne({
          where: { branchName: "Notice Office" },
          attributes: ["id"],
        }).then((branch) => branch.id);

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
          attributes: [
            "id",
            "branchHierarchy",
            "lowerLevelHierarchy",
            "higherLevelHierarchy",
          ],
        });

        if (branchHierarchyConfig) {
          branchHierarchy = branchHierarchyConfig.branchHierarchy;
          highLevelDesignations =
            branchHierarchyConfig.higherLevelHierarchy || [];
          lowLevelDesignations =
            branchHierarchyConfig.lowerLevelHierarchy || [];
        }

        const userBranchSuperintendent = await Employees.findAll({
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: ["designationName"],
              where: { designationName: { [Op.in]: branchHierarchy } },
            },
          ],
          where: { fkBranchId: userBranchId },
        });

        employees = [...userBranchSuperintendent];
      } else {
        const branchHierarchyConfig = await BranchHierarchy.findOne({
          where: { branchName: userBranchName },
        });
        if (branchHierarchyConfig) {
          branchHierarchy = branchHierarchyConfig.branchHierarchy;
          highLevelDesignations =
            branchHierarchyConfig.higherLevelHierarchy || [];
          lowLevelDesignations =
            branchHierarchyConfig.lowerLevelHierarchy || [];
        }

        employees = await Employees.findAll({
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: ["id", "designationName"],
              where: { designationName: { [Op.in]: branchHierarchy } },
            },
          ],
          where: { fkBranchId: userBranchId },
        });
      }
      // Sort employees based on the branch hierarchy
      // const designationMap = branchHierarchy.reduce((acc, designation, index) => {
      //     acc[designation] = index;
      //     return acc;
      // }, {});

      const designationColorMap = branchHierarchy.reduce((acc, designation) => {
        if (highLevelDesignations.includes(designation)) {
          acc[designation] = "Green"; // High level color
        } else if (lowLevelDesignations.includes(designation)) {
          acc[designation] = "Blue"; // Low level color
        }
        return acc;
      }, {});

      // Sort employees based on their mapped positions in the hierarchy
      // employees.sort((a, b) => {
      //     const designationA = a.designations.designationName;
      //     const designationB = b.designations.designationName;
      //     return designationMap[designationA] - designationMap[designationB];
      // });

      employees = employees
        .map((employee) => ({
          ...employee.dataValues,
          color: designationColorMap[employee.designations.designationName],
        }))
        .sort((a, b) => {
          const positionA = branchHierarchy.indexOf(
            a.designations.designationName
          );
          const positionB = branchHierarchy.indexOf(
            b.designations.designationName
          );
          return positionA - positionB;
        });

      return employees;
    } catch (error) {
      console.error("Error Fetching Designations:", error.message);
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
            as: "employee",
            attributes: ["id", "firstName", "lastName"],
            include: [
              {
                model: Branches,
                as: "branches",
                attributes: ["id", "branchName"],
              },
            ],
          },
        ],
      });

      const branchId = user.employee.branches.id;
      // Find all employees who belong to the same department
      const branches = await Branches.findOne({
        where: { id: branchId },
      });

      return branches;
    } catch (error) {
      console.error("Error Fetching Branches:", error.message);
      throw new Error("Error Fetching Branches");
    }
  },

  // delete correspondence id from case notes
  deleteSingleCorrespondence: async (
    caseId,
    paraID,
    correspondenceID = null
  ) => {
    try {
      // Step 1: Find the case note with the specific caseId
      const caseNote = await CaseNotes.findOne({ where: { fkCaseId: caseId } });
      if (!caseNote) throw new Error("Case note not found");

      // Step 2: Update correspondence IDs if provided
      if (correspondenceID !== null) {
        const currentCorrespondenceIds = caseNote.fkCorrespondenceIds || [];
        console.log("Current Correspondence IDs:", currentCorrespondenceIds);

        const updatedCorrespondenceIds = currentCorrespondenceIds.filter(
          (id) => id !== Number(correspondenceID)
        );
        console.log("Updated Correspondence IDs:", updatedCorrespondenceIds);

        await CaseNotes.update(
          { fkCorrespondenceIds: updatedCorrespondenceIds },
          { where: { fkCaseId: caseId } }
        );
      }

      // Step 3: Delete the specific note paragraph
      const deletedNoteParagraph = await NoteParagraphs.destroy({
        where: { id: paraID },
      });
      console.log("Deleted Note Paragraph Count:", deletedNoteParagraph);

      // Step 4: Return success message
      return {
        message:
          "Correspondence ID and specified note paragraph deleted successfully",
        data: {
          correspondenceIDUpdated: correspondenceID !== null,
          deletedNoteParagraph,
        },
      };
    } catch (error) {
      console.error("Error performing the operation:", error);
      throw new Error(error.message || "Error performing the operation");
    }
  },

  // delete correspondence id from case notes table
  deleteCorrespondenceAttachment: async (
    caseId,
    correspondenceID = null,
    paraID
  ) => {
    try {
      // Step 1: Find the case note with the specific caseId
      const caseNote = await CaseNotes.findOne({
        where: { fkCaseId: caseId },
      });

      // Step 2: Check if the case note was found
      if (!caseNote) {
        throw new Error("Case note not found");
      }

      // Step 3: If correspondenceID is provided, update the correspondence IDs
      if (correspondenceID !== null) {
        // Ensure currentCorrespondenceIds is an array
        let currentCorrespondenceIds = caseNote.fkCorrespondenceIds;

        // Log the currentCorrespondenceIds for debugging
        console.log("Current Correspondence IDs:", currentCorrespondenceIds);

        // Check if currentCorrespondenceIds is defined and is an array
        if (!Array.isArray(currentCorrespondenceIds)) {
          throw new Error("Current Correspondence IDs is not an array");
        }

        // Step 4: Filter out the provided correspondenceID from the array
        const updatedCorrespondenceIds = currentCorrespondenceIds.filter(
          (id) => id !== Number(correspondenceID)
        );

        // Log the updatedCorrespondenceIds for debugging
        console.log("Updated Correspondence IDs:", updatedCorrespondenceIds);

        // Step 5: Update the case note with the new set of correspondence IDs
        await CaseNotes.update(
          { fkCorrespondenceIds: updatedCorrespondenceIds },
          { where: { fkCaseId: caseId } }
        );
      } else {
        console.error("Correspondence ID is required");
      }

      // Step 6: Update NoteParagraphs.flags to null for the provided paraID
      const updatedNoteParagraph = await NoteParagraphs.update(
        { flags: null },
        { where: { id: paraID } }
      );

      // Log the updated note paragraph for debugging
      console.log("Updated Note Paragraph Count:", updatedNoteParagraph);

      // Step 7: Return success message
      return {
        message:
          "Correspondence ID updated and Note Paragraph flag cleared successfully.",
        data: {
          correspondenceIDUpdated: correspondenceID !== null,
          updatedNoteParagraph,
        },
      };
    } catch (error) {
      // Log and throw the error for better error handling
      console.error("Error updating correspondence ID:", error);
      throw new Error(error.message || "Error performing the operation");
    }
  },
};

module.exports = casesService;
