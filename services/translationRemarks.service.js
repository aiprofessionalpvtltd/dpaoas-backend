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

      console.log("Branch:", branch);
      

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

  createRemarkService: async ({
    fkQuestionId,
    submittedBy,
    assignedTo,
    comment,
    priority,
    commentStatus,
    category
  }) => {
    try {
      // Create the remark
      const translationRemark = await TranslationRemarks.create(
        {
          fkQuestionId,
          submittedBy,
          assignedTo,
          comment,
          priority: priority || "Routine",
          CommentStatus: commentStatus || "Please Put Up",
          category
        }
      );

      console.log("Remark created:", translationRemark);

      // Optionally reassign the question to a new user
      await Questions.update(
        { assignedTo },
        { where: { id: fkQuestionId } }
      );

      return translationRemark;
    } catch (error) {
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

  getRemarksService: async ({ fkQuestionId, userId }) => {
    try {
      const remarks = await TranslationRemarks.findAll({
        where: { fkQuestionId, category: 'Question' },
        include: [
          {
            model: Users,
            as: 'submittedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName'],
              include:[
                {
                  model: db.designations,
                  as: 'designations',
                  attributes: ['id', 'designationName', 'designationStatus']
                }
              ]
            }]
          },
          {
            model: Users,
            as: 'assignedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName'],
              include:[
                {
                  model: db.designations,
                  as: 'designations',
                  attributes: ['id', 'designationName', 'designationStatus']
                }
              ]
            }
          ]
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      return remarks;
    } catch (error) {
      console.error('Error in getRemarksService:', error);
      throw error;
    }
  },

  getAllAssignedQuestionsWithRemarks: async (userId, category, currentPage = 0, pageSize = 10) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;

       // Build where clause conditionally
       const whereClause = {
        ...(userId && { assignedTo: userId }),
        ...(category && { category })
      };

      // First get all remarks where user is assigned and matches the category
      const { count, rows: assignedRemarks } = await TranslationRemarks.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'fkQuestionId', 'comment', 'CommentStatus', 'priority', 'createdAt', 'category'],
        include: [
          {
            model: Questions,
            as: 'question',
            include: [
              {
                model: Users,
                as: "questionDeletedBy",
                attributes: ["id"],
                include: [{
                  model: Employees,
                  as: "employee",
                  attributes: ["id", "firstName", "lastName"],
                }],
              },
              {
                model: Users,
                as: "questionSubmittedBy",
                attributes: ["id"],
                include: [{
                  model: Employees,
                  as: "employee",
                  attributes: ["id", "firstName", "lastName"],
                }],
              },
              {
                model: db.questionRevival,
                as: "questionRevival",
                include: [
                  {
                    model: db.sessions,
                    as: "ToSession",
                    attributes: ["id", "sessionName"],
                  },
                  {
                    model: db.sessions,
                    as: "FromSession",
                    attributes: ["id", "sessionName"],
                  },
                ],
                attributes: ["id", "fkFromSessionId", "fkToSessionId"],
              },
              {
                model: db.sessions,
                attributes: ["id", "sessionName"],
              },
              {
                model: db.questionStatus,
                as: "questionStatus",
                attributes: ["id", "questionStatus"],
              },
              {
                model: db.members,
                attributes: ["id", "memberName"],
              },
              {
                model: db.questionDiary,
                attributes: ["id", "questionID", "questionDiaryNo"],
              },
              {
                model: db.noticeOfficeDairies,
                as: "noticeOfficeDiary",
                attributes: ["id", "noticeOfficeDiaryNo", "noticeOfficeDiaryDate", "noticeOfficeDiaryTime"],
              },
              {
                model: db.divisions,
                as: "divisions",
                attributes: ["id", "divisionName"],
                include: [{
                  model: db.ministries,
                  attributes: ["id", "ministryName"],
                }],
              },
              {
                model: db.groups,
                as: "groups",
                attributes: ["id", "groupNameStarred", "groupNameUnstarred"],
              },
            ]
          },
          {
            model: Users,
            as: 'submittedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          },
          {
            model: Users,
            as: 'assignedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          }
        ],
        offset,
        limit,
        distinct: true,
        order: [['createdAt', 'DESC']],
      });

      // Group remarks by question
      const questionMap = assignedRemarks.reduce((acc, remark) => {
        if (remark.question) {
          if (!acc[remark.question.id]) {
            acc[remark.question.id] = {
              ...remark.question.dataValues,
              remarks: []
            };
          }
          acc[remark.question.id].remarks.push(remark);
        }
        return acc;
      }, {});

      const questions = Object.values(questionMap);
      const totalPages = Math.ceil(count / pageSize);

      return {
        count,
        totalPages,
        currentPage,
        pageSize,
        data: questions
      };

    } catch (error) {
      console.error('Error in getAllAssignedQuestionsWithRemarks:', error);
      throw new Error('Failed to fetch assigned questions with remarks');
    }
  },

  // Motion remarks

  getMotionRemarksService: async ({ fkMotionId, userId }) => {
    try {
      const remarks = await TranslationRemarks.findAll({
        where: { 
          fkMotionId,
          category: 'Motion'
        },
        include: [
          {
            model: Users,
            as: 'submittedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          },
          {
            model: Users,
            as: 'assignedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          },
          {
            model: db.motions,
            as: 'motion',
            attributes: ['id', 'englishText', 'urduText']
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      return remarks;
    } catch (error) {
      console.error('Error in getMotionRemarksService:', error);
      throw error;
    }
  },

  getAllMotionsWithRemarks: async (userId, currentPage = 0, pageSize = 10) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;

      const { count, rows: assignedRemarks } = await TranslationRemarks.findAndCountAll({
        where: { 
          assignedTo: userId,
          category: 'Motion'
        },
        attributes: ['id', 'fkMotionId', 'comment', 'CommentStatus', 'priority', 'createdAt', 'category'],
        include: [
          {
            model: db.motions,
            as: 'motion',
          },
          {
            model: Users,
            as: 'submittedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          },
          {
            model: Users,
            as: 'assignedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          }
        ],
        offset,
        limit,
        distinct: true,
        order: [['createdAt', 'DESC']],
      });

      // Group remarks by motion
      const motionMap = assignedRemarks.reduce((acc, remark) => {
        if (remark.motion) {
          if (!acc[remark.motion.id]) {
            acc[remark.motion.id] = {
              ...remark.motion.dataValues,
              remarks: []
            };
          }
          acc[remark.motion.id].remarks.push(remark);
        }
        return acc;
      }, {});

      const totalPages = Math.ceil(count / pageSize);

      return {
        count,
        totalPages,
        currentPage,
        pageSize,
        data: Object.values(motionMap)
      };
    } catch (error) {
      console.error('Error in getAllMotionsWithRemarks:', error);
      throw new Error('Failed to fetch assigned motions with remarks');
    }
  },

  getResolutionRemarksService: async ({ fkResolutionId, userId }) => {
    try {
      const remarks = await TranslationRemarks.findAll({
        where: { 
          fkResolutionId,
          category: 'Resolution'
        },
        include: [
          {
            model: Users,
            as: 'submittedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          },
          {
            model: Users,
            as: 'assignedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          },
          {
            model: db.resolutions,
            as: 'resolution',
            attributes: ['id', 'englishText', 'urduText']
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      return remarks;
    } catch (error) {
      console.error('Error in getResolutionRemarksService:', error);
      throw error;
    }
  },

  getAllResolutionsWithRemarks: async (userId, currentPage = 0, pageSize = 10) => {
    try {
      const offset = currentPage * pageSize;
      const limit = pageSize;

      const { count, rows: assignedRemarks } = await TranslationRemarks.findAndCountAll({
        where: { 
          assignedTo: userId,
          category: 'Resolution'
        },
        attributes: ['id', 'fkResolutionId', 'comment', 'CommentStatus', 'priority', 'createdAt', 'category'],
        include: [
          {
            model: db.resolutions,
            as: 'resolution',
          },
          {
            model: Users,
            as: 'submittedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          },
          {
            model: Users,
            as: 'assignedUser',
            attributes: ['id', 'email'],
            include: [{
              model: Employees,
              as: 'employee',
              attributes: ['firstName', 'lastName', 'userName']
            }]
          }
        ],
        offset,
        limit,
        distinct: true,
        order: [['createdAt', 'DESC']],
      });

      // Group remarks by resolution
      const resolutionMap = assignedRemarks.reduce((acc, remark) => {
        if (remark.resolution) {
          if (!acc[remark.resolution.id]) {
            acc[remark.resolution.id] = {
              ...remark.resolution.dataValues,
              remarks: []
            };
          }
          acc[remark.resolution.id].remarks.push(remark);
        }
        return acc;
      }, {});

      const totalPages = Math.ceil(count / pageSize);

      return {
        count,
        totalPages,
        currentPage,
        pageSize,
        data: Object.values(resolutionMap)
      };
    } catch (error) {
      console.error('Error in getAllResolutionsWithRemarks:', error);
      throw new Error('Failed to fetch assigned resolutions with remarks');
    }
  },

};

module.exports = translationServices;
