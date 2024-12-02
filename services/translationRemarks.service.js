const db = require("../models");
const Users = db.users;
const BranchHierarchy = db.branchHierarchies;
const Employees = db.employees;
const Branches = db.branches;
const Designations = db.designations;
const Op = db.Sequelize.Op;


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

  getUserBranchHierarchy: async (userId) => {
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
  
      if (!userWithBranch) {
        throw new Error("User not found");
      }
  
      const userBranchId = userWithBranch.employee.branches.id;
      const userBranchName = userWithBranch.employee.branches.branchName;
  
      const specialBranches = ["Notice Office", "Question", "Motion", "Resolution"];
      let employees = [];
      let branchHierarchy = [];
      let highLevelDesignations = [];
      let lowLevelDesignations = [];
  
      if (specialBranches.includes(userBranchName)) {
        // Special branch handling logic
        const branchHierarchyConfig = await BranchHierarchy.findOne({
          where: { branchName: userBranchName },
          attributes: ["branchHierarchy", "higherLevelHierarchy", "lowerLevelHierarchy"],
        });
  
        if (branchHierarchyConfig) {
          branchHierarchy = branchHierarchyConfig.branchHierarchy;
          highLevelDesignations = branchHierarchyConfig.higherLevelHierarchy || [];
          lowLevelDesignations = branchHierarchyConfig.lowerLevelHierarchy || [];
        }
  
        const noticeOfficeEmployees = await Employees.findAll({
          include: [
            {
              model: Designations,
              as: "designations",
              attributes: ["designationName"],
              where: { designationName: { [Op.in]: branchHierarchy } },
            },
            {
              model: Users,
              as: "users",
              attributes: ["id", "email", "userStatus", "attendance_status"],
            },
          ],
          where: { fkBranchId: userBranchId },
        });
  
        employees = [...noticeOfficeEmployees];
      } else {
        // Default branch handling logic
        const branchHierarchyConfig = await BranchHierarchy.findOne({
          where: { branchName: userBranchName },
        });
  
        if (branchHierarchyConfig) {
          branchHierarchy = branchHierarchyConfig.branchHierarchy;
          highLevelDesignations = branchHierarchyConfig.higherLevelHierarchy || [];
          lowLevelDesignations = branchHierarchyConfig.lowerLevelHierarchy || [];
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
              as: "users",
              attributes: ["id", "email", "userStatus", "attendance_status"],
            },
          ],
          where: { fkBranchId: userBranchId },
        });
      }
  
      const designationColorMap = branchHierarchy.reduce((acc, designation) => {
        if (highLevelDesignations.includes(designation)) {
          acc[designation] = "Green"; 
        } else if (lowLevelDesignations.includes(designation)) {
          acc[designation] = "Blue"; 
        }
        return acc;
      }, {});
  
      employees = employees
        .map((employee) => ({
          ...employee.dataValues,
          color: designationColorMap[employee.designations.designationName],
        }))
        .sort((a, b) => {
          const positionA = branchHierarchy.indexOf(a.designations.designationName);
          const positionB = branchHierarchy.indexOf(b.designations.designationName);
          return positionA - positionB;
        });
  
      return { branchHierarchy, employees };
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



};

module.exports = translationServices;

