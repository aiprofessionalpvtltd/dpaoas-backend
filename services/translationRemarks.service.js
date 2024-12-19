const db = require("../models");
const Users = db.users;
const BranchHierarchy = db.branchHierarchies;
const Employees = db.employees;
const Branches = db.branches;
const Designations = db.designations;
const Op = db.Sequelize.Op;
const Sequelize = require("sequelize");

const TranslationRemarks = db.translationRemarks;
const Questions = db.questions;

const translationServices = {
  // createTranslationRemark: async (data, submittedBy) => {
  //     const transaction = await db.sequelize.transaction();

  //     try {
  //         if (!data || !data.fkQuestionId || !data.comment) {
  //             throw new Error("Missing required fields: fkQuestionId and comment.");
  //         }

  //         const translationRemark = await TranslationRemarks.create(
  //             {
  //                 fkQuestionId: data.fkQuestionId,
  //                 submittedBy: submittedBy,
  //                 assignedTo: data.assignedTo || null,
  //                 comment: data.comment,
  //                 CommentStatus: data.CommentStatus || null,
  //                 priority: data.priority || "Immediate",
  //             },
  //             { transaction }
  //         );

  //         await transaction.commit();
  //         return translationRemark;

  //     } catch (error) {
  //         await transaction.rollback();
  //         console.error("Error Creating Translation Remark", error);
  //         throw new Error(error.message || "Error Creating Translation Remark");
  //     }
  // },

  createTranslationRemark: async (data, submittedBy) => {
    const transaction = await db.sequelize.transaction();

    try {
      if (!data || !data.fkQuestionId || !data.comment) {
        throw new Error("Missing required fields: fkQuestionId and comment.");
      }

      console.log("Saving Translation Remark with Submitted By:", submittedBy);

      const translationRemark = await TranslationRemarks.create(
        {
          fkQuestionId: data.fkQuestionId,
          submittedBy: submittedBy,
          assignedTo: data.assignedTo || null,
          comment: data.comment,
          CommentStatus: data.CommentStatus || null,
          priority: data.priority || "Immediate",
        },
        { transaction }
      );

      await transaction.commit();
      return translationRemark;
    } catch (error) {
      await transaction.rollback();
      console.error("Error Creating Translation Remark", error);
      throw new Error(error.message || "Error Creating Translation Remark");
    }
  },

  // getRemarksAssignedToUser: async (userId) => {
  //   try {
  //     const remarks = await TranslationRemarks.findAll({
  //       where: { assignedTo: userId },
  //       include: [
  //         {
  //           model: Questions,
  //           as: "question",
  //           attributes: ["id", "description"],
  //         },
  //       ],
  //     });

  //     return remarks;
  //   } catch (error) {
  //     console.error("Error fetching remarks for user:", error);
  //     throw new Error(error.message || "Failed to fetch assigned remarks.");
  //   }
  // },

  getRemarksAssignedToUser: async (userId) => {
    try {
      const remarks = await TranslationRemarks.findAll({
        where: { assignedTo: userId },
        include: [
          {
            model: Questions,
            as: "question",
            attributes: ["id", "description"],
            include: [
              {
                model: TranslationRemarks,
                as: "remarks",
                attributes: [
                  "id",
                  "comment",
                  "submittedBy",
                  "CommentStatus",
                  "priority",
                  "createdAt",
                ],
              },
            ],
          },
        ],
      });

      return remarks;
    } catch (error) {
      console.error("Error fetching remarks for user:", error);
      throw new Error(error.message || "Failed to fetch assigned remarks.");
    }
  },

  getTranslationRemarks: async (fkQuestionId) => {
    try {
      if (!fkQuestionId) {
        throw new Error(
          "Question ID is required to fetch translation remarks."
        );
      }

      const translationRemarks = await TranslationRemarks.findAll({
        where: { fkQuestionId },
        include: [
          {
            model: db.users,
            as: "submittedUser",
            include: [
              {
                model: db.employees,
                as: "employee",
                attributes: ["firstName", "lastName", "userName"],
              },
            ],
            attributes: ["id", "email"],
          },
          {
            model: db.users,
            as: "assignedUser",
            include: [
              {
                model: db.employees,
                as: "employee",
                attributes: ["firstName", "lastName", "userName"],
              },
            ],
            attributes: ["id", "email"],
          },
          {
            model: db.questions,
            as: "question",
            attributes: ["id", "englishText", "urduText"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return translationRemarks;
    } catch (error) {
      console.error("Error Fetching Translation Remarks", error);
      throw new Error(error.message || "Error Fetching Translation Remarks");
    }
  },

  getBranchHierarchy: async (branchId, loggedInUserId) => {
    try {
      const branch = await Branches.findOne({
        where: { id: branchId },
        attributes: ["id", "branchName"],
      });

      if (!branch) {
        throw new Error("Branch not found");
      }

      const branchHierarchyConfig = await BranchHierarchy.findOne({
        where: { branchName: branch.branchName },
        attributes: [
          "branchHierarchy",
          "higherLevelHierarchy",
          "lowerLevelHierarchy",
        ],
      });

      if (!branchHierarchyConfig) {
        throw new Error("Branch hierarchy configuration not found");
      }

      const branchHierarchy = branchHierarchyConfig.branchHierarchy;
      const highLevelDesignations =
        branchHierarchyConfig.higherLevelHierarchy || [];
      const lowLevelDesignations =
        branchHierarchyConfig.lowerLevelHierarchy || [];

      const employees = await Employees.findAll({
        include: [
          {
            model: Designations,
            as: "designations",
            attributes: ["id", "designationName"],
            where: { designationName: { [Op.in]: branchHierarchy } },
          },
          {
            model: Users,
            as: "users",
            attributes: ["id", "email", "userStatus", "attendance_status"],
          },
        ],
        where: {
          fkBranchId: branchId,
          fkUserId: { [Op.ne]: loggedInUserId }, // Exclude logged-in user
        },
      });

      const designationColorMap = branchHierarchy.reduce((acc, designation) => {
        if (highLevelDesignations.includes(designation)) {
          acc[designation] = "Green";
        } else if (lowLevelDesignations.includes(designation)) {
          acc[designation] = "Blue";
        }
        return acc;
      }, {});

      const sortedEmployees = employees
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

      return { branchHierarchy, employees: sortedEmployees };
    } catch (error) {
      console.error("Error Fetching Branch Hierarchy:", error.message);
      throw new Error("Error Fetching Branch Hierarchy");
    }
  },

  // getBranchHierarchy: async (branchId, loggedInUserId) => {
  //   try {
  //     const branch = await Branches.findOne({
  //       where: { id: branchId },
  //       attributes: ["id", "branchName"],
  //     });

  //     if (!branch) {
  //       throw new Error("Branch not found");
  //     }

  //     const branchHierarchyConfig = await BranchHierarchy.findOne({
  //       where: { branchName: branch.branchName },
  //       attributes: [
  //         "branchHierarchy",
  //         "higherLevelHierarchy",
  //         "lowerLevelHierarchy",
  //       ],
  //     });

  //     if (!branchHierarchyConfig) {
  //       throw new Error("Branch hierarchy configuration not found");
  //     }

  //     const branchHierarchy = branchHierarchyConfig.branchHierarchy;
  //     const highLevelDesignations =
  //       branchHierarchyConfig.higherLevelHierarchy || [];
  //     const lowLevelDesignations =
  //       branchHierarchyConfig.lowerLevelHierarchy || [];

  //     const employees = await Employees.findAll({
  //       include: [
  //         {
  //           model: Designations,
  //           as: "designations",
  //           attributes: ["id", "designationName"],
  //           where: { designationName: { [Op.in]: branchHierarchy } },
  //         },
  //         {
  //           model: Users,
  //           as: "users",
  //           attributes: ["id", "email", "userStatus", "attendance_status"],
  //         },
  //       ],
  //       where: {
  //         fkBranchId: branchId,
  //         fkUserId: { [Op.ne]: loggedInUserId }, // Exclude logged-in user
  //       },
  //     });

  //     const designationColorMap = branchHierarchy.reduce((acc, designation) => {
  //       if (highLevelDesignations.includes(designation)) {
  //         acc[designation] = "Green";
  //       } else if (lowLevelDesignations.includes(designation)) {
  //         acc[designation] = "Blue";
  //       }
  //       return acc;
  //     }, {});

  //     const sortedEmployees = employees
  //       .map((employee) => ({
  //         ...employee.dataValues,
  //         color: designationColorMap[employee.designations.designationName],
  //       }))
  //       .sort((a, b) => {
  //         const positionA = branchHierarchy.indexOf(
  //           a.designations.designationName
  //         );
  //         const positionB = branchHierarchy.indexOf(
  //           b.designations.designationName
  //         );
  //         return positionA - positionB;
  //       });

  //     return { branchHierarchy, employees: sortedEmployees };
  //   } catch (error) {
  //     console.error("Error Fetching Branch Hierarchy:", error.message);
  //     throw new Error("Error Fetching Branch Hierarchy");
  //   }
  // },

  getTranslationHierarchy: async (userId) => {
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
            {
              model: Users,
              as: "users", // Specify the alias 'users' to match the association in the Employee model
              attributes: ["id", "email", "userStatus", "attendance_status"],
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
            {
              model: Users,
              as: "users", // Specify the alias 'users' to match the association in the Employee model
              attributes: ["id", "email", "userStatus", "attendance_status"],
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
          // userInfo: employee.users.attendance_status,
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

  //Remarkssssssssss-------
  createRemarkService: async ({
    fkQuestionId,
    submittedBy,
    assignedTo,
    comment,
    priority,
    commentStatus,
  }) => {
    const transaction = await TranslationRemarks.sequelize.transaction();
    try {
      // Create the remark
      const translationRemark = await TranslationRemarks.create(
        {
          fkQuestionId,
          submittedBy,
          assignedTo,
          comment,
          priority: priority || "Normal",
          CommentStatus: commentStatus || "Open",
        },
        { transaction }
      );

      console.log("Remark created:", translationRemark);

      // Optionally reassign the question to a new user
      await Questions.update(
        { assignedTo },
        { where: { id: fkQuestionId }, transaction }
      );

      await transaction.commit();

      return translationRemark;
    } catch (error) {
      await transaction.rollback();
      console.error("Error in createRemarkService:", error);
      throw {
        status: 400,
        message: "Failed to create remark and assign question.",
      };
    }
  },

  getRemarksByQuestionIdService: async (questionId) => {
    try {
      const remarks = await TranslationRemarks.findAll({
        where: { fkQuestionId: questionId },
        include: [
          {
            model: Users,
            as: "SubmittedByUser",
            attributes: ["id", "name", "email"],
          },
          {
            model: Users,
            as: "AssignedToUser",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      return remarks;
    } catch (error) {
      console.error("Error in getRemarksByQuestionIdService:", error);
      throw { status: 500, message: "Failed to fetch remarks." };
    }
  },

  
//  getRemarksService : async ({ fkQuestionId, userId }) => {
//   try {
//     // Fetch all remarks related to the given question where the user is either the submitter or assignee
//     const remarks = await TranslationRemarks.findAll({
//       where: {
//         fkQuestionId,     // Filter by question ID
//         [Sequelize.Op.or]: [
//           { submittedBy: userId },  // Remarks by the current user
//           { assignedTo: userId },   // Remarks assigned to the current user
//         ],
//       },
//       include: [
//         {
//           model: Users,
//           as: 'submittedUser',
//           attributes: ['id', 'email'],
//           include: [
//             {
//               model: Employees,
//               as: 'employee',
//               attributes: ['firstName', 'lastName', 'userName'],
//             },
//           ],
//         },
//         {
//           model: Users,
//           as: 'assignedUser',
//           attributes: ['id', 'email'],
//           include: [
//             {
//               model: Employees,
//               as: 'employee',
//               attributes: ['firstName', 'lastName', 'userName'],
//             },
//           ],
//         },
//         {
//           model: Questions,
//           as: 'question',
//           attributes: ['id', 'englishText', 'urduText'],
//         },
//       ],
//       order: [['createdAt', 'ASC']], // Order remarks by creation date (oldest first)
//     });

//     let allRemarks = [];
//     let processedRemarks = new Set(); // To avoid duplicate remarks

//     // Recursive function to traverse the chain of remarks
//     const traverseRemarks = (remark) => {
//       // If this remark is already processed, skip it
//       if (processedRemarks.has(remark.id)) return;

//       // Add the remark to the result set
//       allRemarks.push(remark);
//       processedRemarks.add(remark.id);

//       // Find remarks assigned by this remark
//       const assignedRemarks = remarks.filter(
//         (r) => r.submittedBy === remark.assignedTo || r.assignedTo === remark.assignedTo
//       );

//       // Recursively add remarks assigned by this remark in the chain
//       assignedRemarks.forEach(traverseRemarks);
//     };

//     // Start traversing from the remarks related to the user
//     remarks.forEach(traverseRemarks);

//     // Return the filtered remarks
//     return allRemarks;
//   } catch (error) {
//     console.error("Error in getRemarksService:", error);
//     throw error; // Propagate the error to be handled by the controller
//   }
// },

//  getRemarksService :async ({ fkQuestionId, userId }) => {
//   try {
//     // Fetch all remarks for the given question
//     const remarks = await TranslationRemarks.findAll({
//       where: { fkQuestionId },
//       include: [
//         {
//           model: Users,
//           as: 'submittedUser',
//           attributes: ['id', 'email'],
//           include: [
//             {
//               model: Employees,
//               as: 'employee',
//               attributes: ['firstName', 'lastName', 'userName'],
//             },
//           ],
//         },
//         {
//           model: Users,
//           as: 'assignedUser',
//           attributes: ['id', 'email'],
//           include: [
//             {
//               model: Employees,
//               as: 'employee',
//               attributes: ['firstName', 'lastName', 'userName'],
//             },
//           ],
//         },
//         {
//           model: Questions,
//           as: 'question',
//           attributes: ['id', 'englishText', 'urduText'],
//         },
//       ],
//       order: [['createdAt', 'ASC']], // Order remarks by creation date
//     });

//     // Recursive chain collector
//     const chainCollector = (currentUserId, chainRemarks = []) => {
//       // Find remarks directly assigned to or submitted by the user
//       const userRemarks = remarks.filter(
//         (remark) =>
//           remark.submittedBy === currentUserId || remark.assignedTo === currentUserId
//       );

//       userRemarks.forEach((remark) => {
//         // Avoid duplicates
//         if (!chainRemarks.find((r) => r.id === remark.id)) {
//           chainRemarks.push(remark);

//           // Recursively collect predecessors' remarks
//           chainCollector(remark.submittedBy, chainRemarks);
//         }
//       });

//       return chainRemarks;
//     };

//     // Get the full chain of remarks for the current user
//     const visibleRemarks = chainCollector(userId);

//     return visibleRemarks;
//   } catch (error) {
//     console.error('Error in getRemarksService:', error);
//     throw error; // Propagate error to be handled by the controller
//   }
// },


  getRemarksService : async ({ fkQuestionId, userId }) => {
    try {
      // Fetch all remarks for the given question
      const remarks = await TranslationRemarks.findAll({
        where: { fkQuestionId },
        include: [
          {
            model: Users,
            as: 'submittedUser',
            attributes: ['id', 'email'],
            include: [
              {
                model: Employees,
                as: 'employee',
                attributes: ['firstName', 'lastName', 'userName'],
              },
            ],
          },
          {
            model: Users,
            as: 'assignedUser',
            attributes: ['id', 'email'],
            include: [
              {
                model: Employees,
                as: 'employee',
                attributes: ['firstName', 'lastName', 'userName'],
              },
            ],
          },
          {
            model: Questions,
            as: 'question',
            attributes: ['id', 'englishText', 'urduText'],
          },
        ],
        order: [['createdAt', 'ASC']], // Order remarks by creation date
      });

      // A set to store unique remarks based on remark ID
      const visibleRemarks = new Set();
      const processedUsers = new Set(); // Track the users we've already processed

      // Function to collect all visible remarks for the user and those they are assigned to
      const collectRemarks = (currentUserId) => {
        if (processedUsers.has(currentUserId)) return; // Avoid cycles (prevents revisiting users)
        processedUsers.add(currentUserId);

        // Find remarks where the user is either the submitter or assigned
        const userRemarks = remarks.filter(
          (remark) =>
            remark.submittedBy === currentUserId || remark.assignedTo === currentUserId
        );

        userRemarks.forEach((remark) => {
          if (!visibleRemarks.has(remark.id)) {
            visibleRemarks.add(remark); // Add remark to visible remarks

            // If the remark is assigned to someone, recursively collect their remarks
            if (remark.assignedTo) {
              collectRemarks(remark.assignedTo); // Go deeper into the chain
            }
          }
        });
      };

      // Start from the logged-in user and collect all visible remarks for the user and chain
      collectRemarks(userId);

      // Convert Set back to an array and return
      return Array.from(visibleRemarks);
    } catch (error) {
      console.error('Error in getRemarksService:', error);
      throw error; // Propagate error to be handled by the controller
    }
  },

};

module.exports = translationServices;
