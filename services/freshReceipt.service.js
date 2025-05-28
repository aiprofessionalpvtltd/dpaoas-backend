const db = require("../models");
const Divisions = db.divisions;
const Branches = db.branches;
const BranchHierarchy = db.branchHierarchies;
const Ministries = db.ministries;
const FreshReceipts = db.freshReceipts;
const FilesNotifications = db.filesNotifications;
const FileDiaries = db.fileDiaries;
const FreshReceiptAttachments = db.freshReceiptsAttachments;
const FreshReceiptRemarks = db.freshReceiptRemarks;
const Users = db.users;
const Employee = db.employees;
const Designations = db.designations;
const ExternalMinistries = db.externalMinistries;
const Cases = db.cases;
const Op = db.Sequelize.Op;
const logger = require("../common/winston");
const { error } = require("../validation/userValidation");
const { PageSizes } = require("pdf-lib");
const moment = require("moment-timezone");
const freshReceiptService = {
  // Create External Ministries
  createExternalMinistry: async (req) => {
    try {
      const externalMinistry = await ExternalMinistries.create({
        receivedFrom: req.receivedFrom ? req.receivedFrom : null,
        description: req.description ? req.description : null,
      });
      return externalMinistry;
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
        fkExternalMinistryId: req.fkExternalMinistryId
          ? req.fkExternalMinistryId
          : null,
        frSubType: req.frSubType ? req.frSubType : null,
      });

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
        fkFreshReceiptId: fr.id,
      });

      if (files && files.length > 0) {
        const attachments = files.map((file) => {
          const path = file.destination.replace("./public/", "/public/");
          return {
            filename: `${path}/${file.filename}`,
            fkFreshReceiptId: fr.id,
          };
        });
        await FreshReceiptAttachments.bulkCreate(attachments);
      }

      return fr;
    } catch (error) {
      throw { message: error.message || "Error Creating FR!" };
    }
  },

  // Upload Multiple FRs
  uploadMultipleFRs: async (files, freshReceiptId) => {
    try {
      if (files && files.length > 0) {
        const attachments = files.map((file) => {
          const path = file.destination.replace("./public/", "/public/");
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
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id"],
          include: [
            {
              model: Designations,
              as: "designations",
            },
          ],
        },
      ],
    });

    if (user && user.employee.designations) {
      return user.employee.designations.designationName;
    } else {
      throw new Error("User or designation not found");
    }
  },

  // Get Current User's Branch
  getCurrentUserBranch: async (userId) => {
    const user = await Users.findOne({
      where: { id: userId },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id"],
          include: [
            {
              model: Branches,
              as: "branches",
            },
          ],
        },
      ],
    });

    if (user && user.employee.branches) {
      return {
        id: user.employee.branches.id,
        branchName: user.employee.branches.branchName,
      };
    } else {
      throw new Error("User or designation not found");
    }
  },

// Get All FRs On User Basis
getAllFRs: async (currentPage, pageSize, userId, branchId) => {
  try {
    // Convert pageSize and currentPage to integers to avoid issues with string values
    const limit = parseInt(pageSize);
    const offset = parseInt(currentPage) * limit;

    // Get the current user's position and branch
    const currentUserPosition = await freshReceiptService.getCurrentUserPosition(userId);
    const currentUserBranch = await freshReceiptService.getCurrentUserBranch(userId);

    // Fetch all FreshReceipts based on branchId and filter out those with cases
    const allFRs = await FreshReceipts.findAll({
      where: {
        fkUserBranchId: branchId, // external-demo
        $notExists$: db.sequelize.literal(
          `NOT EXISTS (SELECT 1 FROM "cases" WHERE "cases"."fkFreshReceiptId" = "freshReceipts"."id")`
        ),
      },
      include: [
        {
          model: FreshReceiptAttachments,
          as: "freshReceiptsAttachments",
          attributes: ["id", "filename"],
        },
        {
          model: FreshReceiptRemarks,
          as: "freshReceipt",
          separate: true,
          attributes: [
            "id",
            "CommentStatus",
            "comment",
            "submittedBy",
            "assignedTo",
            "priority",
            "createdAt",
            "updatedAt",
          ],
          order: [["id", "DESC"]],
          include: [
            {
              model: Users,
              as: "submittedUser",
              attributes: ["id"],
              include: [
                {
                  model: Employee,
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
                  model: Employee,
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
        },
        {
          model: FileDiaries,
          as: "freshReceiptDiaries",
          attributes: [
            "id",
            "fileNumber",
            "diaryNumber",
            "diaryType",
            "diaryDate",
            "diaryTime",
          ],
        },
        {
          model: Branches,
          as: "userBranches",
          attributes: ["id", "branchName"],
        },
        {
          model: Branches,
          as: "branches",
          attributes: ["id", "branchName"],
        },
        {
          model: Ministries,
          as: "ministries",
          attributes: ["id", "ministryName"],
        },
        {
          model: ExternalMinistries,
          as: "externalMinistry",
          attributes: ["id", "receivedFrom"],
        },
        {
          model: Users,
          as: "createdByUser",
          attributes: ["id"],
          include: [
            {
              model: Employee,
              as: "employee",
              attributes: ["id", "firstName", "lastName"],
              include: [
                {
                  model: Designations,
                  as: "designations",
                  attributes: ["id", "designationName"],
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
      order: [["id", "DESC"]],
    });

    // Fetch branch hierarchy data
    const branchHierarchyData = await BranchHierarchy.findOne({
      where: { branchName: currentUserBranch.branchName },
      attributes: [
        "id",
        "branchHierarchy",
        "higherLevelHierarchy",
        "lowerLevelHierarchy",
      ],
    });

    const lowerLevelHierarchy = branchHierarchyData?.lowerLevelHierarchy;
    const higherLevelHierarchy = branchHierarchyData?.higherLevelHierarchy;

    // Filter FRs based on user permissions and visibility
    const filteredFRsWithStatus = await Promise.all(
      allFRs.map(async (fr) => {
        const remarks = fr.freshReceipt || [];
        const createdBy = fr.createdBy || 0;
        let isVisible = false;
        let isEditable = true;
        let caseStatus = "draft";

        // Check user permissions for visibility and editability
        if (
          parseInt(userId) === createdBy ||
          parseInt(remarks?.[0]?.submittedBy) === parseInt(userId)
        ) {
          isVisible = true;
          isEditable = remarks.length === 0;
        }

        // Update caseStatus and visibility based on latest remark
        if (remarks.length > 0) {
          const latestRemark = remarks.reduce(
            (latest, remark) => (latest.createdAt > remark.createdAt ? latest : remark),
            { createdAt: new Date(0), assignedTo: null }
          );

            // // If there is a latest remark, check if the user is the one it's assigned to
            // if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
            //     caseStatus = "pending";
            //   isVisible = true; // The assigned user can also see the case
            //   isEditable = true; // The assigned user can edit the case
            // }
            // else {
            //     caseStatus = "sent"; // Assigned to another user
            //     isVisible = false;
            //     isEditable = false;
            //   }

          if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
            caseStatus = "pending";
            isVisible = true;
            isEditable = true;
          } else if (
            parseInt(latestRemark.submittedBy) !== parseInt(userId) &&
            parseInt(latestRemark.assignedTo) !== parseInt(userId)
          ) {
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

        // Add editable and caseStatus fields
        fr.isEditable = isEditable;
        fr.caseStatus = caseStatus;

        return isVisible ? fr : null;
      })
    );

    // Filter out any null FRs
    const visibleFRs = filteredFRsWithStatus.filter((fr) => fr !== null);

    // Paginate the visible FRs
    const paginatedFRs = visibleFRs.slice(offset, offset + limit);

    // Calculate total pages based on visible FRs
    const totalPages = Math.ceil(visibleFRs.length / limit);

    // Return the paginated data along with the total count and total pages
    return {
      count: visibleFRs.length,
      totalPages,
      freshReceipts: paginatedFRs,
    };
  } catch (error) {
    throw new Error(error.message || "Error Fetching All FRs");
  }
},

getFRsByUserAndStatus: async (userId, branchId, caseStatus, currentPage, pageSize) => {
  try {
    const limit = parseInt(pageSize);
    const offset = parseInt(currentPage) * limit;

    const priorities = ['Confidential', 'Immediate', 'Routine'];
    const priorityCounts = priorities.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    const allFRs = await FreshReceipts.findAll({
      where: {
        $notExists$: db.sequelize.literal(
          `NOT EXISTS (SELECT 1 FROM "cases" WHERE "cases"."fkFreshReceiptId" = "freshReceipts"."id")`
        ),
      },
      include: [
        {
          model: FreshReceiptAttachments,
          as: "freshReceiptsAttachments",
          attributes: ["id", "filename"],
        },
        {
          model: FreshReceiptRemarks,
          as: "freshReceipt",
          separate: true,
          attributes: [
            "id", "CommentStatus", "comment", "submittedBy", "assignedTo", "priority", "createdAt", "updatedAt"
          ],
          order: [["id", "DESC"]],
          include: [
            {
              model: Users,
              as: "submittedUser",
              attributes: ["id"],
              include: [{
                model: Employee,
                as: "employee",
                attributes: ["id", "firstName", "lastName"],
                include: [{
                  model: Designations,
                  as: "designations",
                  attributes: ["id", "designationName"],
                }],
              }],
            },
            {
              model: Users,
              as: "assignedUser",
              attributes: ["id"],
              include: [{
                model: Employee,
                as: "employee",
                attributes: ["id", "firstName", "lastName"],
                include: [{
                  model: Designations,
                  as: "designations",
                  attributes: ["id", "designationName"],
                }],
              }],
            },
          ],
        },
        {
          model: FileDiaries,
          as: "freshReceiptDiaries",
          attributes: ["id", "fileNumber", "diaryNumber", "diaryType", "diaryDate", "diaryTime"],
        },
        {
          model: Branches,
          as: "userBranches",
          attributes: ["id", "branchName"],
        },
        {
          model: Branches,
          as: "branches",
          attributes: ["id", "branchName"],
        },
        {
          model: Ministries,
          as: "ministries",
          attributes: ["id", "ministryName"],
        },
        {
          model: ExternalMinistries,
          as: "externalMinistry",
          attributes: ["id", "receivedFrom"],
        },
        {
          model: Users,
          as: "createdByUser",
          attributes: ["id"],
          include: [{
            model: Employee,
            as: "employee",
            attributes: ["id", "firstName", "lastName"],
            include: [
              {
                model: Designations,
                as: "designations",
                attributes: ["id", "designationName"],
              },
              {
                model: Branches,
                as: "branches",
                attributes: ["id", "branchName"],
              },
            ],
          }],
        },
      ],
      order: [["id", "DESC"]],
    });

    const filteredFRs = [];

    for (const fr of allFRs) {
      const remarks = fr.freshReceipt || [];
      if (remarks.length === 0) continue;

      // Find the latest remark by createdAt
      const latestRemark = remarks.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }, remarks[0]);

      const assignedTo = parseInt(latestRemark.assignedTo);
      const submittedBy = parseInt(latestRemark.submittedBy);

      let isVisible = false;
      let editable = false;
      let derivedStatus = fr.caseStatus; // fallback

      if (caseStatus === 'pending' && assignedTo === parseInt(userId)) {
        isVisible = true;
        editable = true;
        derivedStatus = 'pending';
      } else if (caseStatus === 'sent' && submittedBy === parseInt(userId)) {
        isVisible = true;
        editable = false;
        derivedStatus = 'sent';
      }

      if (isVisible) {
        if (latestRemark.priority && priorityCounts.hasOwnProperty(latestRemark.priority)) {
          priorityCounts[latestRemark.priority]++;
        }

        const frWithDerivedStatus = {
          ...fr.toJSON(),
          caseStatus: derivedStatus,
          isEditable: editable,
        };

        filteredFRs.push(frWithDerivedStatus);
      }
    }

    const paginatedFRs = filteredFRs.slice(offset, offset + limit);
    const totalPages = Math.ceil(filteredFRs.length / limit);

    return {
      freshReceipts: paginatedFRs,
      count: filteredFRs.length,
      totalPages,
      priorityCounts,
    };

  } catch (error) {
    throw new Error(error.message || 'Error fetching FRs by user and status');
  }
},


  // Get All FRs On User Basis
  getAllPendingFRs: async (currentPage, pageSize, branchId, branches, userId) => {
    try {

      const offset = currentPage * pageSize;
      const limit = pageSize;

      const { count, rows } = await FreshReceipts.findAndCountAll({
        where: {
            // fkUserBranchId: {
            //         [Op.in]: Array.isArray(branches) ? branches : [branches], // Use the array of branch IDs
            //       }, external-demo
          // Add the NOT EXISTS condition to check the Cases table
          // '$notExists$': db.sequelize.literal(`NOT EXISTS (SELECT 1 FROM "cases" WHERE "cases"."fkFreshReceiptId" = "freshReceipts"."id")`)
        },
        include: [
          {
            model: Users,
            as: "createdByUser", // Alias for createdByUser association
            attributes: ["id"],
            include: [
              {
                model: Employee,
                as: "employee",
                attributes: ["id", "firstName", "lastName"],
                include: [
                  {
                    model: Designations,
                    as: "designations",
                    attributes: ["id", "designationName"],
                  },
                  {
                    model: Branches,
                    as: "branches", // Ensure this alias matches your association
                    attributes: ["id", "branchName"], // Include branch attributes you need
                  },
                ],
              },
            ],
          },
          {
            model: FreshReceiptAttachments,
            as: "freshReceiptsAttachments",
            attributes: ["id", "filename"],
          },
          {
            model: FreshReceiptRemarks,
            as: "freshReceipt",
            separate: true,
            attributes: [
              "id",
              "CommentStatus",
              "comment",
              "submittedBy",
              "assignedTo",
              "priority",
              "createdAt",
              "updatedAt",
            ],

            order: [["id", "DESC"]],
            include: [
              {
                model: Users,
                as: "submittedUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employee,
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
                    model: Employee,
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
          },
          {
            model: FileDiaries,
            as: "freshReceiptDiaries",
            attributes: [
              "id",
              "fileNumber",
              "diaryNumber",
              "diaryType",
              "diaryDate",
              "diaryTime",
            ],
          },
          {
            model: Branches,
            as: "userBranches",
            attributes: ["id", "branchName"],
          },
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
          {
            model: Ministries,
            as: "ministries",
            attributes: ["id", "ministryName"],
          },
          {
            model: ExternalMinistries,
            as: "externalMinistry",
            attributes: ["id", "receivedFrom"],
          },
          {
            model: Users,
            as: "createdByUser",
            attributes: ["id"],
            include: [
              {
                model: Employee,
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
        offset,
        limit,
        distinct: true,
        order: [["id", "DESC"]],
      });

      let isVisible = false;
      let isEditable = true;

      const filterConditions = await Promise.all(
        rows.map(async (fr) => {
          const remarks = fr.freshReceipt || [];
          const createdBy = fr.createdBy || 0;
          const createdByUser = fr.createdByUser || 0;

          let caseStatus = "draft";
          let latestRemark;
          // let isVisible = parseInt(userId) === createdBy && remarks.length > 0;
          // let isEditable = isVisible && remarks.length === 0;

          // Initial visibility is only for the creator
          if (
            parseInt(userId) === createdBy ||
            parseInt(latestRemark?.submittedBy) === parseInt(userId)
          ) {
            // i remove this one (=== createdBy)
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

            // // If there is a latest remark, check if the user is the one it's assigned to
            // if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
            //     caseStatus = "pending";
            //   isVisible = true; // The assigned user can also see the case
            //   isEditable = true; // The assigned user can edit the case
            // }
            // else {
            //     caseStatus = "sent"; // Assigned to another user
            //     isVisible = false;
            //     isEditable = false;
            //   }

            if (parseInt(latestRemark.assignedTo) === parseInt(userId)) {
              caseStatus = "pending"; // Assigned to current user
              isVisible = true;
              isEditable = true;
            } else if (
              parseInt(latestRemark.submittedBy) !== parseInt(userId) &&
              parseInt(latestRemark.assignedTo) !== parseInt(userId)
            ) {
              caseStatus = "sent";
              // Hide case if the current user is not involved in the latest remark
              if (parseInt(userId) !== createdBy) {
                // But still show if the user is the creator
                caseStatus = "sent";
                isVisible = false;
                isEditable = false;
              }
            } else {
              caseStatus = "sent"; // Assigned to another user
              isVisible = true;
              isEditable = false;
            }

            // else {
            // Ensure the creator retains visibility even when not the latest assigned
            // isVisible = isVisible || parseInt(createdBy) === parseInt(userId);
            //   isVisible = false;
            //   isEditable = false; // Creator cannot edit once assigned to someone else
            // }
          }

          return {
            isVisible,
            isEditable,
            caseStatus,
            createdByUser: {
              id: createdByUser.id,
              firstName: createdByUser.employee?.firstName || "",
              lastName: createdByUser.employee?.lastName || "",
              designation:
                createdByUser.employee?.designations?.designationName || "",
            },
            branch: {
              id: createdByUser.employee?.branches?.id || "",
              name: createdByUser.employee?.branches?.branchName || "",
            },
          };
        })
      );

      // Filter the FRs based on visibility and update with editability
      const filteredFRs = rows.filter((fr, index) => {
        const condition = filterConditions[index];
        fr.isEditable = condition.isEditable;
        fr.caseStatus = condition.caseStatus;
        return condition.isVisible && condition.caseStatus === "pending";
      });

      const paginatedFRs = filteredFRs.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      );
      const totalPages = Math.ceil(filteredFRs.length / pageSize);

      return {
        count: paginatedFRs.length,
        totalPages,
        freshReceipts: paginatedFRs,
      };
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
        order: [["id", "DESC"]],
      });

      const totalPages = Math.ceil(count / pageSize);
      return { count, totalPages, externalMinistries: rows };
    } catch (error) {
      console.log(error);
      throw { message: error.message };
    }
  },

  getAllFRsByBranch: async (branchId, currentPage, pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;
  
      const { count, rows } = await FreshReceipts.findAndCountAll({
        where: {
          fkUserBranchId: branchId,
        },
        include: [
          {
            model: FreshReceiptAttachments,
            as: "freshReceiptsAttachments",
            attributes: ["id", "filename"],
          },
          {
            model: FreshReceiptRemarks,
            as: "freshReceipt",
            separate: true,
            attributes: [
              "id",
              "CommentStatus",
              "comment",
              "submittedBy",
              "assignedTo",
              "priority",
              "createdAt",
              "updatedAt",
            ],
            order: [["id", "DESC"]],
            include: [
              {
                model: Users,
                as: "submittedUser",
                attributes: ["id"],
                include: [
                  {
                    model: Employee,
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
                    model: Employee,
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
          },
          {
            model: FileDiaries,
            as: "freshReceiptDiaries",
            attributes: [
              "id",
              "fileNumber",
              "diaryNumber",
              "diaryType",
              "diaryDate",
              "diaryTime",
            ],
          },
          {
            model: Branches,
            as: "userBranches",
            attributes: ["id", "branchName"],
          },
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
          {
            model: Ministries,
            as: "ministries",
            attributes: ["id", "ministryName"],
          },
          {
            model: ExternalMinistries,
            as: "externalMinistry",
            attributes: ["id", "receivedFrom"],
          },
          {
            model: Users,
            as: "createdByUser",
            attributes: ["id"],
            include: [
              {
                model: Employee,
                as: "employee",
                attributes: ["id", "firstName", "lastName"],
                include: [
                  {
                    model: Designations,
                    as: "designations",
                    attributes: ["id", "designationName"],
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
        offset,
        limit,
        distinct: true,
        order: [["id", "DESC"]],
      });
  
      const freshReceiptsWithStatus = rows.map((fr) => {
        const remarks = fr.freshReceipt || [];
        let caseStatus = "draft";
        let isEditable = true;
  
        if (remarks.length > 0) {
          const latestRemark = remarks.reduce(
            (latest, remark) =>
              latest.createdAt > remark.createdAt ? latest : remark,
            { createdAt: new Date(0), assignedTo: null }
          );
  
          if (latestRemark.assignedTo) {
            caseStatus = "pending";
            isEditable = true;
          } else {
            caseStatus = "sent";
            isEditable = false;
          }
        }
  
        fr.caseStatus = caseStatus;
        fr.isEditable = isEditable;
        return fr;
      });
  
      const totalPages = Math.ceil(count / pageSize);
  
      return {
        count,
        totalPages,
        freshReceipts: freshReceiptsWithStatus,
      };
    } catch (error) {
      throw new Error(error.message || "Error Fetching FRs by Branch");
    }
  },
  
  //Get Frs History On The Basis of Branch
  getFRsHistory: async (branchId, userId, currentPage, pageSize) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;
      const { count, rows } = await FreshReceipts.findAndCountAll({
        where: {
          fkUserBranchId: branchId,
          $notExists$: db.sequelize.literal(
            `NOT EXISTS (SELECT 1 FROM "cases" WHERE "cases"."fkFreshReceiptId" = "freshReceipts"."id")`
          ),
          createdBy: userId,
        },
        include: [
          {
            model: FreshReceiptAttachments,
            as: "freshReceiptsAttachments",
            attributes: ["id", "filename"],
          },
          {
            model: FreshReceiptRemarks,
            as: "freshReceipt",
            separate: true,
            attributes: [
              "id",
              "CommentStatus",
              "comment",
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
                    model: Employee,
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
                    model: Employee,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                  },
                ],
              },
            ],
          },
          {
            model: Users,
            as: "createdByUser",
            attributes: ["id"],
            include: [
              {
                model: Employee,
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
            model: FileDiaries,
            as: "freshReceiptDiaries",
            attributes: [
              "id",
              "fileNumber",
              "diaryNumber",
              "diaryType",
              "diaryDate",
              "diaryTime",
            ],
          },
          {
            model: Branches,
            as: "userBranches",
            attributes: ["id", "branchName"],
          },
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
          {
            model: Ministries,
            as: "ministries",
            attributes: ["id", "ministryName"],
          },
          {
            model: ExternalMinistries,
            as: "externalMinistry",
            attributes: ["id", "receivedFrom"],
          },
        ],
        offset,
        limit,
        distinct: true,
        order: [["id", "DESC"]],
      });

      const totalPages = Math.ceil(count / pageSize);
      return { count, totalPages, freshReceipts: rows };
    } catch (error) {
      throw new Error(error.message || "Error Fetching FRs History");
    }
  },

  //Get all Frs History of upper herarchy
  getFRsUpperHerarchyHistory: async (
    branchId,
    userId,
    currentPage,
    pageSize
  ) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;
      const { count, rows } = await FreshReceipts.findAndCountAll({
        where: {
          fkUserBranchId: branchId,
          $notExists$: db.sequelize.literal(
            `NOT EXISTS (SELECT 1 FROM "cases" WHERE "cases"."fkFreshReceiptId" = "freshReceipts"."id")`
          ),
          // createdBy : userId
        },
        include: [
          {
            model: FreshReceiptAttachments,
            as: "freshReceiptsAttachments",
            attributes: ["id", "filename"],
          },
          {
            model: FreshReceiptRemarks,
            as: "freshReceipt",
            separate: true,
            attributes: [
              "id",
              "CommentStatus",
              "comment",
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
                    model: Employee,
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
                    model: Employee,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName"],
                  },
                ],
              },
            ],
          },
          {
            model: Users,
            as: "createdByUser",
            attributes: ["id"],
            include: [
              {
                model: Employee,
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
            model: FileDiaries,
            as: "freshReceiptDiaries",
            attributes: [
              "id",
              "fileNumber",
              "diaryNumber",
              "diaryType",
              "diaryDate",
              "diaryTime",
            ],
          },
          {
            model: Branches,
            as: "userBranches",
            attributes: ["id", "branchName"],
          },
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
          {
            model: Ministries,
            as: "ministries",
            attributes: ["id", "ministryName"],
          },
          {
            model: ExternalMinistries,
            as: "externalMinistry",
            attributes: ["id", "receivedFrom"],
          },
        ],
        offset,
        limit,
        distinct: true,
        order: [["id", "DESC"]],
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
          id: freshReceiptId,
        },
        include: [
          {
            model: Users,
            as: "createdByUser", // Alias for createdByUser association
            attributes: ["id"],
            include: [
              {
                model: Employee,
                as: "employee",
                attributes: ["id", "firstName", "lastName"],
                include: [
                  {
                    model: Designations,
                    as: "designations",
                    attributes: ["id", "designationName"],
                  },
                  {
                    model: Branches,
                    as: "branches", // Ensure this alias matches your association
                    attributes: ["id", "branchName"], // Include branch attributes you need
                  },
                ],
              },
            ],
          },
          {
            model: FreshReceiptAttachments,
            as: "freshReceiptsAttachments",
            attributes: ["id", "filename"],
          },
          {
            model: FreshReceiptRemarks,
            as: "freshReceipt",
            attributes: [
              "id",
              "CommentStatus",
              "comment",
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
                    model: Employee,
                    as: "employee",
                    attributes: ["id", "firstName", "lastName", "userType"],
                    include: [
                      {
                        model: Designations,
                        as: "designations",
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
                    model: Employee,
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
            model: FileDiaries,
            as: "freshReceiptDiaries",
            attributes: [
              "id",
              "fileNumber",
              "diaryNumber",
              "diaryType",
              "diaryDate",
              "diaryTime",
            ],
          },
          {
            model: Branches,
            as: "userBranches",
            attributes: ["id", "branchName"],
          },
          {
            model: Branches,
            as: "branches",
            attributes: ["id", "branchName"],
          },
          {
            model: Ministries,
            as: "ministries",
            attributes: ["id", "ministryName"],
          },
          {
            model: ExternalMinistries,
            as: "externalMinistry",
            attributes: ["id", "receivedFrom"],
          },
        ],
        order: [
          [{ model: FreshReceiptRemarks, as: "freshReceipt" }, "id", "DESC"],
        ],
      });

      result.freshReceipt.forEach((remark) => {
        const formattedDateCreatedAt = moment(remark.createdAt)
          .tz("Asia/Karachi")
          .format("DD-MM-YYYY");
        const formattedTimeCreatedAt = moment(remark.createdAt)
          .tz("Asia/Karachi")
          .format("hh:mm A");
        remark.dataValues.formattedDateCreatedAt = formattedDateCreatedAt;
        remark.dataValues.formattedTimeCreatedAt = formattedTimeCreatedAt;
      });

      if (!result) {
        throw { message: "Fresh Receipt Not Found!" };
      }
      return result;
    } catch (error) {
      console.error("Error Fetching Fresh Receipt:", error.message);
    }
  },

  // Update FR
  updateFR: async (req, files, freshReceiptId) => {
    try {
      // Create the FR and save it in the database
      await FreshReceipts.update(
        {
          frType: req.frType,
          fkBranchId: req.fkBranchId,
          fkMinistryId: req.fkMinistryId,
          frSubject: req.frSubject,
          referenceNumber: req.referenceNumber,
          frDate: req.frDate,
          shortDescription: req.shortDescription,
          frSubType: req.frSubType,
          fkExternalMinistryId: req.fkExternalMinistryId,
          // createdBy: req.createdBy
        },
        {
          where: { id: freshReceiptId },
        }
      );
      await FileDiaries.update(
        {
          diaryType: req.diaryType,
          diaryNumber: req.diaryNumber,
          diaryDate: req.diaryDate,
          diaryTime: req.diaryTime,
          fkFreshReceiptId: freshReceiptId,
        },
        {
          where: { fkFreshReceiptId: freshReceiptId },
        }
      );

      if (files && files.length > 0) {
        // Remove existing attachments for this FR
        await FreshReceiptAttachments.destroy({
          where: { fkFreshReceiptId: freshReceiptId },
        });

        // Check if files array has elements
        if (files.length > 0) {
          const attachments = files.map((file) => {
            const path = file.destination.replace("./public/", "/public/");
            return {
              filename: `${path}/${file.filename}`,
              fkFreshReceiptId: freshReceiptId,
            };
          });
          await FreshReceiptAttachments.bulkCreate(attachments);
        }
      }

      // Return the updated FR details
      const updatedFR = await FreshReceipts.findOne({
        where: { id: freshReceiptId },
      });
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
        priority: req.priority ? req.priority : "Immediate",
        comment: req.comment ? req.comment : null,
      });

      // Create the File Notification
      await FilesNotifications.create({
        fkUserId: req.assignedTo,
        readStatus: false,
        fkFreshReceiptId: freshReceiptId,
      });
      return frRemarks;
    } catch (error) {
      throw new Error(error.message || "Error Creating Case!");
    }
  },

  // Delete FR
  deleteFR: async (freshReceiptId) => {
    try {
      const updatedData = {
        status: "inactive",
      };
      await FreshReceipts.update(updatedData, {
        where: { id: freshReceiptId },
      });
      // Fetch the updated FR after the update
      const deletedFR = await FreshReceipts.findOne({
        where: { id: freshReceiptId },
      });
      return deletedFR;
    } catch (error) {
      throw { message: error.message || "Error Deleting FR!" };
    }
  },
};

module.exports = freshReceiptService;
