//const dbConfig = require("../database/db.config");
const database = require("../database/db.config");
const SequelizeMain = require("sequelize");
const sequelize = new SequelizeMain(
  database.DB,
  database.USER,
  database.PASSWORD,
  {
    host: database.HOST,
    dialect: database.DIALECT,
    port: database.PORT,
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection to the database has been established successfully."
    );
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
const db = {};

db.Sequelize = SequelizeMain;
db.sequelize = sequelize;
db.roles = require("./roles.model.js")(sequelize, SequelizeMain);
db.users = require("./users.model.js")(sequelize, SequelizeMain);
db.permissions = require("./permissions.model")(sequelize, SequelizeMain);
db.rolesPermissions = require("./rolesPermissions.model")(
  sequelize,
  SequelizeMain
);
db.userSession = require("./userSession.model")(sequelize, SequelizeMain);
db.modules = require("./module.model")(sequelize, SequelizeMain);
db.leaveTypes = require("./leaveType.model")(sequelize, SequelizeMain);
db.requestLeaves = require("./requestLeave.model")(sequelize, SequelizeMain);
db.leaveComments = require("./leaveComments.model")(sequelize, SequelizeMain);
db.employees = require("./employee.model")(sequelize, SequelizeMain);
db.designations = require("./designations.model")(sequelize, SequelizeMain);
db.departments = require("./departments.model")(sequelize, SequelizeMain);
db.branches = require("./branches.model")(sequelize, SequelizeMain);
db.branchHierarchies = require("./branchHierarchy.model")(
  sequelize,
  SequelizeMain
);
db.noticeOfficeDairies = require("./noticeOfficeDairies.model")(
  sequelize,
  SequelizeMain
);
db.motionStatuses = require("./motionStatuses.model")(sequelize, SequelizeMain);
db.ministries = require("./ministries.model")(sequelize, SequelizeMain);
db.members = require("./members.model")(sequelize, SequelizeMain);
db.motionMovers = require("./motionMovers.model")(sequelize, SequelizeMain);
db.motionMinistries = require("./motionMinistry.model")(
  sequelize,
  SequelizeMain
);
db.motionStatusHistories = require("./motionStatusHistory.model")(
  sequelize,
  SequelizeMain
);
db.sessions = require("./sessions.model")(sequelize, SequelizeMain);
db.motions = require("./motions.model")(sequelize, SequelizeMain);
// resolution
db.resolutionStatus = require("./resolutionStatus.model")(
  sequelize,
  SequelizeMain
);
db.resolutionMovers = require("./resolutionMovers.model")(
  sequelize,
  SequelizeMain
);
db.resolutionDiaries = require("./resolutionDiary.model")(
  sequelize,
  SequelizeMain
);
db.resolutions = require("./resolution.model")(sequelize, SequelizeMain);
// Questions
db.questionStatus = require("./questionStatus.model")(sequelize, SequelizeMain);
db.questions = require("./questions.model")(sequelize, SequelizeMain);
db.sessions = require("./sessions.model")(sequelize, SequelizeMain);
db.questionStatus = require("./questionStatus.model")(sequelize, SequelizeMain);
db.questions = require("./questions.model")(sequelize, SequelizeMain);
db.sessions = require("./sessions.model")(sequelize, SequelizeMain);
db.divisions = require("./divisions.model")(sequelize, SequelizeMain);
db.groups = require("./groups.model")(sequelize, SequelizeMain);
db.noticeOfficeDiary = require("./noticeOfficeDiary.model")(
  sequelize,
  SequelizeMain
);
db.groupsDivisions = require("./groupsDivisions.model")(
  sequelize,
  SequelizeMain
);
db.questionDefer = require("./questionDefer.model")(sequelize, SequelizeMain);
db.questionFile = require("./questionFile.model")(sequelize, SequelizeMain);
db.questionRevival = require("./questionRevival.model")(
  sequelize,
  SequelizeMain
);
db.questionDiary = require("./questionDiary.model")(sequelize, SequelizeMain);
db.questionStatusHistory = require("./questionStatusHistories")(
  sequelize,
  SequelizeMain
);
// Manage Session
db.manageSessions = require("./manageSession.model")(sequelize, SequelizeMain);
db.sessionAttendances = require("./sessionAttendance.model")(
  sequelize,
  SequelizeMain
);
db.seatingPlans = require("./seatingPlan.model")(sequelize, SequelizeMain);
// Question Lists
db.rota = require("./rota.model")(sequelize, SequelizeMain);
db.newRota = require("./newRota.model")(sequelize, SequelizeMain);
db.furtherAllotmentDays = require("./furtherAllotmentDays.model")(
  sequelize,
  SequelizeMain
);
db.questionLists = require("./questionList.model")(sequelize, SequelizeMain);
db.questionQuestionLists = require("./questionQuestionList.model")(
  sequelize,
  SequelizeMain
);
db.supplementaryLists = require("./supplementaryList.model")(
  sequelize,
  SequelizeMain
);
db.questionSupplementaryLists = require("./questionSupplementaryList.model")(
  sequelize,
  SequelizeMain
);

db.employees.belongsTo(db.users, { as: "users", foreignKey: "fkUserId" });
db.users.hasOne(db.employees, { as: "employee", foreignKey: "fkUserId" });

db.passes = require("./pass.model")(sequelize, SequelizeMain);
db.visitors = require("./visitor.model")(sequelize, SequelizeMain);
db.passVisitors = require("./passVisitor.model")(sequelize, SequelizeMain);

// Roles and Permissions
db.permissions.belongsToMany(db.roles, {
  as: "roles",
  through: "rolesPermissions",
  foreignKey: "permissionId",
});
db.roles.belongsToMany(db.permissions, {
  as: "permissions",
  through: "rolesPermissions",
  foreignKey: "roleId",
});
db.permissions.belongsTo(db.modules, {
  as: "modules",
  foreignKey: "fkModuleId",
});

// Roles Permissions Association
db.rolesPermissions.belongsTo(db.roles, {
  as: "RolesPermissions",
  foreignKey: "roleId",
});
db.rolesPermissions.belongsTo(db.permissions, {
  as: "PermissionsRoles",
  foreignKey: "permissionId",
});

// // Employee Association
// db.employees.belongsTo(db.departments, { foreignKey: 'fkDepartmentId'});
// db.employees.belongsTo(db.designations, { foreignKey: 'fkDesignationId'})
// db.employees.belongsTo(db.users , { foreignKey: 'fkUserId'})
db.groupsDivisions = require("./groupsDivisions.model")(
  sequelize,
  SequelizeMain
);
db.questionDefer = require("./questionDefer.model")(sequelize, SequelizeMain);
db.questionFile = require("./questionFile.model")(sequelize, SequelizeMain);
db.questionRevival = require("./questionRevival.model")(
  sequelize,
  SequelizeMain
);
db.questionDiary = require("./questionDiary.model")(sequelize, SequelizeMain);
db.questionStatusHistory = require("./questionStatusHistories")(
  sequelize,
  SequelizeMain
);
// Manage Session
db.manageSessions = require("./manageSession.model")(sequelize, SequelizeMain);
db.manageSessions = require("./manageSession.model")(sequelize, SequelizeMain);
db.sessionAttendances = require("./sessionAttendance.model")(
  sequelize,
  SequelizeMain
);
db.seatingPlans = require("./seatingPlan.model")(sequelize, SequelizeMain);
db.sessionMemberDetails = require("./sessionMemberDetails.model")(
  sequelize,
  SequelizeMain
);
db.sessionBreakDetails = require("./sessionBreakDetails.model")(
  sequelize,
  SequelizeMain
);
// SMS Module
db.contactTemplates = require("./contactTemplates.model.js")(
  sequelize,
  SequelizeMain
);
db.contactLists = require("./contactLists.model.js")(sequelize, SequelizeMain);
db.contactListUsers = require("./contactListUsers.model.js")(
  sequelize,
  SequelizeMain
);
db.smsSents = require("./smsSents.model.js")(sequelize, SequelizeMain);
// Question Lists
db.questionLists = require("./questionList.model")(sequelize, SequelizeMain);
db.questionQuestionLists = require("./questionQuestionList.model")(
  sequelize,
  SequelizeMain
);
db.supplementaryLists = require("./supplementaryList.model")(
  sequelize,
  SequelizeMain
);
db.questionSupplementaryLists = require("./questionSupplementaryList.model")(
  sequelize,
  SequelizeMain
);
// Manage Complaints
db.inventories = require("./inventory.model")(sequelize, SequelizeMain);
db.complaints = require("./mainComplaint.model")(sequelize, SequelizeMain);
db.complaintTypes = require("./complaintTypes.model")(sequelize, SequelizeMain);
db.complaintCategories = require("./complaintCategories.model")(
  sequelize,
  SequelizeMain
);
db.resolverAssignments = require("./resolverAssignment.model")(
  sequelize,
  SequelizeMain
);
db.inventoryBills = require("./inventoryBill.model")(sequelize, SequelizeMain);
db.userInventory = require("./userInventory.model")(sequelize, SequelizeMain);
db.vendors = require("./vendor.model")(sequelize, SequelizeMain);
db.vendors = require("./vendor.model")(sequelize, SequelizeMain);
db.tonerModels = require("./tonerModel.model")(sequelize, SequelizeMain);
db.tonerInstallations = require("./tonerInstallation.model")(
  sequelize,
  SequelizeMain
);
// Rbac
// db.employees.belongsTo(db.users, { as: 'user', foreignKey: 'fkUserId' });
// db.employees.belongsTo(db.departments, { as: 'employeeDepartment', foreignKey: 'fkDepartmentId' }),
// db.employees.belongsTo(db.designations, { as: 'employeeDesignation', foreignKey: 'fkDesignationId' })

// Question Management
db.tenures = require("./tenures.model")(sequelize, SequelizeMain);
db.years = require("./years.model")(sequelize, SequelizeMain);

db.terms = require("./terms.model")(sequelize, SequelizeMain);
db.politicalParties = require("./politicalParties.model")(
  sequelize,
  SequelizeMain
);
db.parliamentaryYears = require("./parliamentaryYears.model")(
  sequelize,
  SequelizeMain
);
db.divisions = require("./divisions.model")(sequelize, SequelizeMain);

//Files Management
db.files = require("./file.model.js")(sequelize, SequelizeMain);
db.freshReceipts = require("./freshReceipt.model")(sequelize, SequelizeMain);
db.newFiles = require("./newFile.model")(sequelize, SequelizeMain);
db.mainHeadingFiles = require("./mainHeadingFile.model")(
  sequelize,
  SequelizeMain
);
db.fileRegisters = require("./fileRegisters.model")(sequelize, SequelizeMain);
db.freshReceiptsAttachments = require("./freshReceiptAttachements.model")(
  sequelize,
  SequelizeMain
);
db.fileRemarks = require("./fileRemarks.model.js")(sequelize, SequelizeMain);
db.fileDiaries = require("./fileDiaries.model.js")(sequelize, SequelizeMain);
db.fileAttachments = require("./fileAttachments.model.js")(
  sequelize,
  SequelizeMain
);
db.cases = require("./cases.model")(sequelize, SequelizeMain);
db.sectionsCases = require("./sectionsCases.model")(sequelize, SequelizeMain);
db.caseAttachments = require("./caseAttachments.model")(
  sequelize,
  SequelizeMain
);
db.fileUserDiaries = require("./fileUserDiary.model")(sequelize, SequelizeMain);
db.freshReceiptRemarks = require("./freshReceiptRemarks.model")(
  sequelize,
  SequelizeMain
);
db.filesNotifications = require("./filesNotifications.model")(
  sequelize,
  SequelizeMain
);
db.fileSignatures = require("./fileSignature.model")(sequelize, SequelizeMain);
db.externalMinistries = require("./externalMinistries.model")(
  sequelize,
  SequelizeMain
);
db.correspondences = require("./correspondences.model")(
  sequelize,
  SequelizeMain
);
db.correspondenceAttachments = require("./correspondenceAttachments.model")(
  sequelize,
  SequelizeMain
);
db.caseNotes = require("./caseNotes.model")(sequelize, SequelizeMain);
db.noteParagraphs = require("./noteParagraphs.model")(sequelize, SequelizeMain);

// db.fileRemarks.belongsTo(db.employees, { foreignKey: 'commentBy', as: 'employees' });

//private member bill
db.privateMemberBills = require("./privateMemberBills.model.js")(
  sequelize,
  SequelizeMain
);
//legislative Bills
db.legislativeBills = require("./legislativeBills.model.js")(
  sequelize,
  SequelizeMain
);
// speech on demand
db.speechOnDemands = require("./speechOnDemands.model.js")(
  sequelize,
  SequelizeMain
);
// Research Services
db.researchServices = require("./researchServices.model.js")(
  sequelize,
  SequelizeMain
);
//motion listing
db.motionLists = require("./motionList.model.js")(sequelize, SequelizeMain);
db.motionMotionLists = require("./motionMotionLists.model.js")(
  sequelize,
  SequelizeMain
);
// resolution Listing
db.resolutionLists = require("./resolutionLists.model.js")(
  sequelize,
  SequelizeMain
);
db.resolutionResolutionLists = require("./resolutionResolutionLists.model.js")(
  sequelize,
  SequelizeMain
);
// public users login
db.publicUsers = require("./publicUsers.model.js")(sequelize, SequelizeMain);
// MNA's
db.mnas = require("./mnas.model.js")(sequelize, SequelizeMain);
// introduced In Senate Bill
db.introducedInSenateBills = require("./introducedInSenateBills.model.js")(
  sequelize,
  SequelizeMain
);
// Senate Bill Ministry Movers
db.senateBillMinistryMovers = require("./senateBillMinistryMovers.model.js")(
  sequelize,
  SequelizeMain
);
// Senate Bill Mnas Movers
db.senateBillMnaMovers = require("./senateBillMnaMovers.model.js")(
  sequelize,
  SequelizeMain
);
// Senate Bill Senator Movers
db.senateBillSenatorMovers = require("./senateBillSenatorMovers.model.js")(
  sequelize,
  SequelizeMain
);
// Event Calender
db.eventCalenders = require("./eventCalenders.model.js")(
  sequelize,
  SequelizeMain
);

// bill statuses
db.billStatuses = require("./billStatuses.model.js")(sequelize, SequelizeMain);
// Manage Committee
db.manageCommittees = require("./manageCommittees.model.js")(
  sequelize,
  SequelizeMain
);
// Manage Committee Recommendations
db.manageCommitteeRecomendations = require("./manageCommitteeRecomendations.model.js")(
  sequelize,
  SequelizeMain
);
// Intoduced in house
db.introducedInHouses = require("./introducedInHouses.model.js")(
  sequelize,
  SequelizeMain
);
// Memeber Passage Details
db.memberPassages = require("./memberPassages.model.js")(
  sequelize,
  SequelizeMain
);
// Documentation Details bills
db.billDocuments = require("./billDocuments.model.js")(
  sequelize,
  SequelizeMain
);
// Ordinance Model
db.ordinances = require("./ordinances.model.js")(sequelize, SequelizeMain);
db.ordinanceDocuments = require("./ordinanceDocuments.model.js")(sequelize, SequelizeMain);

// mnaMinistries model
db.mnaMinistries = require("./mnaMinistries.model.js")(sequelize, SequelizeMain);

//db.fileRemarks.belongsTo(db.users, { foreignKey: 'commentBy', as: 'users' });
db.files.hasMany(db.fileAttachments, {
  as: "fileAttachments",
  foreignKey: "fkFileId",
});
// db.filedairies.belongsTo(db.users, { foreignKey: 'fkUserId', as: 'users' });
//db.files.hasMany(db.fileRemarks, { as: 'fileRemarks', foreignKey: 'fkFileId' });
//db.files.hasMany(db.filedairies, { as: 'filedairies', foreignKey: 'fkFileId' });
db.fileDiaries.belongsTo(db.freshReceipts, {
  foreignKey: "fkFreshReceiptId",
  as: "freshReceipts",
});
db.fileDiaries.belongsTo(db.branches, {
  foreignKey: "fkBranchId",
  as: "branches",
});

db.freshReceipts.belongsTo(db.branches, {
  foreignKey: "fkBranchId",
  as: "branches",
});
db.freshReceipts.belongsTo(db.branches, {
  foreignKey: "fkUserBranchId",
  as: "userBranches",
});
db.freshReceipts.belongsTo(db.ministries, {
  foreignKey: "fkMinistryId",
  as: "ministries",
});
db.freshReceipts.hasOne(db.fileDiaries, {
  foreignKey: "fkFreshReceiptId",
  as: "freshReceiptDiaries",
});
db.freshReceipts.hasMany(db.freshReceiptsAttachments, {
  foreignKey: "fkFreshReceiptId",
  as: "freshReceiptsAttachments",
});
db.freshReceipts.belongsTo(db.users, {
  foreignKey: "createdBy",
  as: "createdByUser",
});
db.freshReceipts.hasMany(db.freshReceiptRemarks, {
  foreignKey: "fkFreshReceiptId",
  as: "freshReceipt",
});
db.freshReceipts.belongsTo(db.externalMinistries, {
  foreignKey: "fkExternalMinistryId",
  as: "externalMinistry",
});

db.cases.belongsTo(db.newFiles, { foreignKey: "fkFileId", as: "files" });
db.cases.belongsTo(db.freshReceipts, {
  foreignKey: "fkFreshReceiptId",
  as: "freshReceipts",
});
db.cases.belongsTo(db.users, { foreignKey: "createdBy", as: "createdByUser" });

db.cases.hasMany(db.sectionsCases, {
  foreignKey: "fkCaseId",
  as: "sectionCases",
});
db.cases.hasMany(db.fileSignatures, {
  foreignKey: "fkCaseId",
  as: "digitalSignature",
});
db.sectionsCases.belongsTo(db.cases, { foreignKey: "fkCaseId", as: "cases" });
db.caseAttachments.belongsTo(db.sectionsCases, {
  foreignKey: "fkSectionId",
  as: "sectionCases",
});
db.sectionsCases.hasMany(db.caseAttachments, {
  foreignKey: "fkSectionId",
  as: "caseAttachments",
});

db.files.belongsTo(db.ministries, {
  foreignKey: "fkMinistryId",
  as: "ministries",
});
db.files.belongsTo(db.departments, {
  foreignKey: "fkdepartmentId",
  as: "departments",
});
db.employees.belongsTo(db.departments, {
  as: "departments",
  foreignKey: "fkDepartmentId",
});
db.employees.belongsTo(db.designations, {
  as: "designations",
  foreignKey: "fkDesignationId",
});
db.employees.belongsTo(db.branches, {
  foreignKey: "fkBranchId",
  as: "branches",
});

db.files.belongsTo(db.branches, { foreignKey: "fkBranchId", as: "branches" });
db.files.belongsTo(db.employees, {
  foreignKey: "submittedBy",
  as: "employees",
});
db.newFiles.belongsTo(db.branches, {
  foreignKey: "fkBranchId",
  as: "branches",
});
db.newFiles.belongsTo(db.mainHeadingFiles, {
  foreignKey: "fkMainHeadingId",
  as: "mainHeading",
});
db.newFiles.belongsTo(db.fileRegisters, {
  foreignKey: "fkFileRegisterId",
  as: "fileRegister",
});
db.newFiles.hasMany(db.fileRemarks, {
  foreignKey: "fkFileId",
  as: "filesRemarks",
});
//db.newFiles.hasMany(db.sectionsCases, { foreignKey: 'fkFileId', as: 'filesCases' })
db.fileRemarks.belongsTo(db.users, {
  foreignKey: "submittedBy",
  as: "submittedUser",
});
db.fileRemarks.belongsTo(db.users, {
  foreignKey: "assignedTo",
  as: "assignedUser",
});
db.fileRemarks.belongsTo(db.newFiles, { foreignKey: "fkFileId", as: "file" });
db.fileRemarks.belongsTo(db.cases, { foreignKey: "fkCaseId", as: "case" });

db.freshReceiptRemarks.belongsTo(db.users, {
  foreignKey: "submittedBy",
  as: "submittedUser",
});
db.freshReceiptRemarks.belongsTo(db.users, {
  foreignKey: "assignedTo",
  as: "assignedUser",
});
db.freshReceiptRemarks.belongsTo(db.freshReceipts, {
  foreignKey: "fkFreshReceiptId",
  as: "freshReceipt",
});

db.cases.hasMany(db.fileRemarks, {
  foreignKey: "fkCaseId",
  as: "casesRemarks",
});
db.cases.hasMany(db.fileUserDiaries, {
  foreignKey: "fkCaseId",
  as: "fileDiary",
});
db.fileUserDiaries.belongsTo(db.users, {
  foreignKey: "fkSubmittedByUserId",
  as: "submittedByUser",
});
db.mainHeadingFiles.belongsTo(db.branches, {
  foreignKey: "fkBranchId",
  as: "branches",
});
db.fileRegisters.belongsTo(db.branches, {
  foreignKey: "fkBranchId",
  as: "branches",
});

db.filesNotifications.belongsTo(db.users, {
  foreignKey: "fkUserId",
  as: "users",
});
db.filesNotifications.belongsTo(db.newFiles, {
  foreignKey: "fkFileId",
  as: "files",
});
db.filesNotifications.belongsTo(db.freshReceipts, {
  foreignKey: "fkFreshReceiptId",
  as: "freshReceipt",
});
db.filesNotifications.belongsTo(db.cases, {
  foreignKey: "fkCaseId",
  as: "case",
});
db.fileSignatures.belongsTo(db.users, { as: "users", foreignKey: "fkUserId" });

db.correspondences.belongsTo(db.branches, {
  as: "branch",
  foreignKey: "fkBranchId",
});
db.correspondences.hasMany(db.correspondenceAttachments, {
  foreignKey: "fkCorrespondenceId",
  as: "correspondenceAttachments",
});
db.caseNotes.belongsTo(db.branches, { foreignKey: "fkBranchId", as: "branch" });
db.caseNotes.belongsTo(db.newFiles, { foreignKey: "fkFileId", as: "files" });
db.caseNotes.belongsTo(db.cases, { foreignKey: "fkCaseId", as: "cases" });
db.noteParagraphs.belongsTo(db.caseNotes, {
  foreignKey: "fkCaseNoteId",
  as: "noteParagraphs",
});
db.noteParagraphs.belongsTo(db.users, {
  foreignKey: "createdBy",
  as: "createdByUser",
});
// db.employees.belongsTo(db.users, { as: 'users', foreignKey: 'fkUserId' });

// db.employees.belongsTo(db.users, { as: "users", foreignKey: "fkUserId" });

// // Question Management
// db.tenures = require("./tenures.model")(sequelize, SequelizeMain);
// db.terms = require("./terms.model")(sequelize, SequelizeMain)
// db.politicalParties = require("./politicalParties.model")(sequelize, SequelizeMain);
// db.parliamentaryYears = require("./parliamentaryYears.model")(sequelize, SequelizeMain)
// db.divisions = require("./divisions.model")(sequelize, SequelizeMain)

// //Files Management
// db.files = require("./file.model.js")(sequelize, SequelizeMain);
// db.freshReceipts = require("./freshReceipt.model")(sequelize, SequelizeMain)
// db.newFiles = require('./newFile.model')(sequelize, SequelizeMain)
// db.mainHeadingFiles = require('./mainHeadingFile.model')(sequelize, SequelizeMain)
// db.fileRegisters = require('./fileRegisters.model')(sequelize, SequelizeMain)
// db.freshReceiptsAttachments = require('./freshReceiptAttachements.model')(sequelize, SequelizeMain)
// db.fileRemarks = require("./fileRemarks.model.js")(sequelize, SequelizeMain);
// db.fileDiaries = require("./fileDiaries.model.js")(sequelize, SequelizeMain);
// db.fileAttachments = require("./fileAttachments.model.js")(sequelize, SequelizeMain);
// db.cases = require("./cases.model")(sequelize, SequelizeMain)
// db.sectionsCases = require('./sectionsCases.model')(sequelize, SequelizeMain)
// db.caseAttachments = require('./caseAttachments.model')(sequelize, SequelizeMain)
// db.fileUserDiaries = require('./fileUserDiary.model')(sequelize,SequelizeMain)
// db.freshReceiptRemarks = require('./freshReceiptRemarks.model')(sequelize,SequelizeMain)
// db.filesNotifications = require('./filesNotifications.model')(sequelize,SequelizeMain)

// // db.fileRemarks.belongsTo(db.employees, { foreignKey: 'commentBy', as: 'employees' });

// //private member bill
// db.privateMemberBills = require("./privateMemberBills.model.js")(sequelize, SequelizeMain);
// //legislative Bills
// db.legislativeBills = require("./legislativeBills.model.js")(sequelize, SequelizeMain);

// // speech on demand
// db.speechOnDemands = require("./speechOnDemands.model.js")(sequelize, SequelizeMain);
// // Research Services
// db.researchServices = require("./researchServices.model.js")(sequelize, SequelizeMain);
// //motion listing
// db.motionLists = require("./motionList.model.js")(sequelize, SequelizeMain);
// db.motionMotionLists = require("./motionMotionLists.model.js")(sequelize, SequelizeMain);

// // resolution Listing
// db.resolutionLists = require("./resolutionLists.model.js")(sequelize, SequelizeMain);
// db.resolutionResolutionLists = require("./resolutionResolutionLists.model.js")(sequelize, SequelizeMain);

// // public users login
// db.publicUsers = require("./publicUsers.model.js")(sequelize, SequelizeMain);

// //db.fileRemarks.belongsTo(db.users, { foreignKey: 'commentBy', as: 'users' });
// db.files.hasMany(db.fileAttachments, { as: 'fileAttachments', foreignKey: 'fkFileId' });
// // db.filedairies.belongsTo(db.users, { foreignKey: 'fkUserId', as: 'users' });
// //db.files.hasMany(db.fileRemarks, { as: 'fileRemarks', foreignKey: 'fkFileId' });
// //db.files.hasMany(db.filedairies, { as: 'filedairies', foreignKey: 'fkFileId' });
// db.fileDiaries.belongsTo(db.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipts' });
// db.fileDiaries.belongsTo(db.branches, { foreignKey: 'fkBranchId' , as: 'branches'})

// db.freshReceipts.belongsTo(db.branches, { foreignKey: 'fkBranchId', as: 'branches' });
// db.freshReceipts.belongsTo(db.branches, { foreignKey: 'fkUserBranchId', as: 'userBranches' });
// db.freshReceipts.belongsTo(db.ministries, { foreignKey: 'fkMinistryId', as: 'ministries' });
// db.freshReceipts.hasOne(db.fileDiaries, { foreignKey: 'fkFreshReceiptId', as: 'freshReceiptDiaries' })
// db.freshReceipts.hasMany(db.freshReceiptsAttachments, { foreignKey: 'fkFreshReceiptId', as: "freshReceiptsAttachments" })
// db.freshReceipts.belongsTo(db.users, { foreignKey: 'createdBy', as: 'createdByUser' });
// db.freshReceipts.hasMany(db.freshReceiptRemarks , { foreignKey: 'fkFreshReceiptId', as: 'freshReceipt'})

// db.cases.belongsTo(db.newFiles, { foreignKey: 'fkFileId', as: 'files' })
// db.cases.belongsTo(db.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipts' });
// db.cases.belongsTo(db.users , {foreignKey: 'createdBy', as: 'createdByUser' } )

// db.cases.hasMany(db.sectionsCases, { foreignKey: 'fkCaseId', as: 'sectionCases' })
// db.sectionsCases.belongsTo(db.cases, { foreignKey: 'fkCaseId', as: 'cases' });
// db.caseAttachments.belongsTo(db.sectionsCases, { foreignKey: 'fkSectionId', as: 'sectionCases' });
// db.sectionsCases.hasMany(db.caseAttachments, { foreignKey: 'fkSectionId', as: 'caseAttachments' })

// db.files.belongsTo(db.ministries, { foreignKey: 'fkMinistryId', as: 'ministries' });
// db.files.belongsTo(db.departments, { foreignKey: 'fkdepartmentId', as: 'departments' });
// db.employees.belongsTo(db.departments, { as: 'departments', foreignKey: 'fkDepartmentId' });
// db.employees.belongsTo(db.designations, { as: 'designations', foreignKey: 'fkDesignationId' });
// db.employees.belongsTo(db.branches , { foreignKey: 'fkBranchId', as: 'branches'})

// db.files.belongsTo(db.branches, { foreignKey: 'fkBranchId', as: 'branches' });
// db.files.belongsTo(db.employees, { foreignKey: 'submittedBy', as: 'employees' });
// db.newFiles.belongsTo(db.branches, { foreignKey: 'fkBranchId', as: 'branches' });
// db.newFiles.belongsTo(db.mainHeadingFiles, { foreignKey: 'fkMainHeadingId', as: 'mainHeading' });
// db.newFiles.belongsTo(db.fileRegisters, { foreignKey: 'fkFileRegisterId', as: 'fileRegister' })
// db.newFiles.hasMany(db.fileRemarks,{ foreignKey: 'fkFileId' , as: 'filesRemarks' })
// //db.newFiles.hasMany(db.sectionsCases, { foreignKey: 'fkFileId', as: 'filesCases' })
// db.fileRemarks.belongsTo(db.users, { foreignKey: 'submittedBy', as: 'submittedUser' });
// db.fileRemarks.belongsTo(db.users, { foreignKey: 'assignedTo', as: 'assignedUser' });
// db.fileRemarks.belongsTo(db.newFiles, { foreignKey: 'fkFileId', as: 'file' });
// db.fileRemarks.belongsTo(db.cases, { foreignKey: 'fkCaseId', as: 'case' });

// db.freshReceiptRemarks.belongsTo(db.users, { foreignKey: 'submittedBy', as: 'submittedUser' });
// db.freshReceiptRemarks.belongsTo(db.users, { foreignKey: 'assignedTo', as: 'assignedUser' });
// db.freshReceiptRemarks.belongsTo(db.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipt' });

// db.cases.hasMany(db.fileRemarks, { foreignKey: 'fkCaseId', as: 'casesRemarks' })
// db.cases.hasMany(db.fileUserDiaries , { foreignKey: 'fkCaseId', as: 'fileDiary'})
// db.fileUserDiaries.belongsTo(db.users, {foreignKey: 'fkSubmittedByUserId', as: 'submittedByUser'})
// db.mainHeadingFiles.belongsTo(db.branches, { foreignKey: 'fkBranchId', as: 'branches' });
// db.fileRegisters.belongsTo(db.branches, { foreignKey: 'fkBranchId', as: 'branches' });

// db.filesNotifications.belongsTo(db.users, { foreignKey: 'fkUserId' });
// db.filesNotifications.belongsTo(db.newFiles, { foreignKey: 'fkFileId', as: 'files' });
// db.filesNotifications.belongsTo(db.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipt' });
// db.filesNotifications.belongsTo(db.cases, { foreignKey: 'fkCaseId', as: 'case' });

db.members.belongsTo(db.tenures, { foreignKey: "fkTenureId", as: "tenures" });
db.members.belongsTo(db.terms, { foreignKey: "fkTermId", as: "terms" });
db.members.belongsTo(db.politicalParties, {
  foreignKey: "politicalParty",
  as: "politicalParties",
});
db.members.belongsTo(db.parliamentaryYears, {
  foreignKey: "fkParliamentaryYearId",
  as: "parliamentaryYears",
});

db.motions.hasMany(db.motionMovers, {
  foreignKey: "fkMotionId",
  as: "motionMovers",
});
db.motions.hasMany(db.motionMinistries, {
  foreignKey: "fkMotionId",
  as: "motionMinistries",
});
db.motions.belongsTo(db.users, {
  as: "createdBy",
  foreignKey: "createdByUser",
});
db.motions.belongsTo(db.branches, {
  as: "initiatedBy",
  foreignKey: "initiatedByBranch",
});
db.motions.belongsTo(db.branches, { as: "sentTo", foreignKey: "sentToBranch" });
db.sessions.hasMany(db.motions, { foreignKey: "fkSessionId" });
db.sessions.hasMany(db.manageSessions, { foreignKey: "fkSessionId" });
db.motions.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "sessions",
});
db.motions.belongsTo(db.noticeOfficeDairies, {
  foreignKey: "fkDairyNumber",
  as: "noticeOfficeDairies",
});
db.noticeOfficeDairies.hasMany(db.motions, { foreignKey: "fkDairyNumber" });
db.motions.belongsTo(db.motionStatuses, {
  foreignKey: "fkMotionStatus",
  as: "motionStatuses",
});
db.motionStatuses.hasMany(db.motions, {
  foreignKey: "fkMotionStatus",
  as: "motionStatuses",
});
db.motions.hasMany(db.motionStatusHistories, {
  foreignKey: "fkMotionId",
  as: "motionStatusHistories",
});
db.motionStatusHistories.belongsTo(db.motionStatuses, {
  foreignKey: "fkMotionStatusId",
  as: "motionStatuses",
});
db.motionMovers.belongsTo(db.members, {
  foreignKey: "fkMemberId",
  as: "members",
});
db.motionMinistries.belongsTo(db.ministries, {
  foreignKey: "fkMinistryId",
  as: "ministries",
});
db.questions.belongsTo(db.questionDiary, { foreignKey: "fkQuestionDiaryId" });
db.questions.belongsTo(db.sessions, { foreignKey: "fkSessionId" });
db.questions.belongsTo(db.questionStatus, {
  foreignKey: "fkQuestionStatus",
  as: "questionStatus",
});
db.questions.belongsTo(db.members, { foreignKey: "fkMemberId" });
db.questions.belongsTo(db.noticeOfficeDairies, {
  as: "noticeOfficeDiary",
  foreignKey: "fkNoticeDiary",
});
db.questions.belongsTo(db.divisions, {
  as: "divisions",
  foreignKey: "fkDivisionId",
});
db.questions.belongsTo(db.groups, { as: "groups", foreignKey: "fkGroupId" });
db.questions.hasMany(db.questionRevival, {
  as: "questionRevival",
  foreignKey: "fkQuestionId",
});
db.questions.hasMany(db.questionDefer, {
  as: "questionDefer",
  foreignKey: "fkQuestionId",
});
db.questions.belongsTo(db.users, {
  foreignKey: "deletedBy",
  as: "questionDeletedBy",
});
db.questions.belongsTo(db.users, {
  foreignKey: "submittedBy",
  as: "questionSubmittedBy",
});
db.questions.hasMany(db.questionQuestionLists, {
  foreignKey: "fkQuestionId",
  as: "questionQuestionList",
});
db.questions.hasMany(db.questionSupplementaryLists, {
  foreignKey: "fkQuestionId",
  as: "questionQuestionSuppList",
});
db.questions.belongsTo(db.users, {
  as: "createdBy",
  foreignKey: "createdByUser",
});

db.questionFile.belongsTo(db.questions, { foreignKey: "fkQuestionId" });
db.questionRevival.belongsTo(db.questions, { foreignKey: "fkQuestionId" });
db.questionRevival.belongsTo(db.questionStatus, {
  foreignKey: "fkQuestionStatus",
});
db.questionRevival.belongsTo(db.questionDiary, {
  foreignKey: "fkQuestionDiaryId",
});
// db.questionRevival.belongsTo(db.divisions , { as: 'divisions', foreignKey: 'fkDivisionId'})
//db.questionRevival.belongsTo(db.groups, { as: 'groups', foreignKey: 'fkGroupId' })
db.questionDefer.belongsTo(db.questions, {
  foreignKey: "fkQuestionId",
  as: "deferQuestion",
});
db.questionDefer.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "deferredSession",
});
db.questionDefer.belongsTo(db.users, {
  foreignKey: "deferredBy",
  as: "deferredByUser",
});

db.questionStatusHistory.belongsTo(db.sessions, { foreignKey: "fkSessionId" });
db.questionStatusHistory.belongsTo(db.questionStatus, {
  foreignKey: "fkQuestionStatus",
});
db.questions.hasMany(db.questionStatusHistory, { foreignKey: "fkQuestionId" });
db.questions.belongsTo(db.branches, {
  as: "initiatedBy",
  foreignKey: "initiatedByBranch",
});
db.questions.belongsTo(db.branches, {
  as: "sentTo",
  foreignKey: "sentToBranch",
});
db.questionFile.belongsTo(db.questions, { foreignKey: "fkQuestionId" });
db.questionRevival.belongsTo(db.questions, { foreignKey: "fkQuestionId" });
db.questionRevival.belongsTo(db.sessions, {
  as: "FromSession",
  foreignKey: "fkFromSessionId",
});
db.questionRevival.belongsTo(db.sessions, {
  as: "ToSession",
  foreignKey: "fkToSessionId",
});
db.questionRevival.belongsTo(db.questionStatus, {
  foreignKey: "fkQuestionStatus",
});
db.questionRevival.belongsTo(db.questionDiary, {
  foreignKey: "fkQuestionDiaryId",
});
db.questionRevival.belongsTo(db.noticeOfficeDairies, {
  as: "noticeOfficeDiary",
  foreignKey: "fkNoticeDiaryId",
});
db.questionRevival.belongsTo(db.divisions, {
  as: "divisions",
  foreignKey: "fkDivisionId",
});
db.questionRevival.belongsTo(db.groups, {
  as: "groups",
  foreignKey: "fkGroupId",
});
//db.questionDefer.belongsTo(db.questions, { foreignKey: 'fkQuestionId' })
//db.questionDefer.belongsTo(db.sessions, { foreignKey: 'fkSessionId' });
db.questionDefer.belongsTo(db.questions, { foreignKey: "fkQuestionId" });
db.questionDefer.belongsTo(db.sessions, { foreignKey: "fkSessionId" });
db.questionStatusHistory.belongsTo(db.sessions, { foreignKey: "fkSessionId" });
db.questionStatusHistory.belongsTo(db.questionStatus, {
  foreignKey: "fkQuestionStatus",
});
db.questions.hasMany(db.questionStatusHistory, { foreignKey: "fkQuestionId" });
db.users.hasMany(db.requestLeaves, {
  foreignKey: "fkUserId",
  as: "requestLeaves",
});
//db.users.belongsTo(db.Departments, { foreignKey: 'fkDepartmentId', as: 'departments' });
db.requestLeaves.belongsTo(db.users, { foreignKey: "fkUserId", as: "users" });
db.leaveComments.belongsTo(db.requestLeaves, {
  foreignKey: "fkRequestLeaveId",
  as: "requestLeaves",
});
db.requestLeaves.hasMany(db.leaveComments, {
  foreignKey: "fkRequestLeaveId",
  as: "leaveComments",
});
db.leaveComments.belongsTo(db.users, {
  foreignKey: "commentedBy",
  as: "users",
});
//db.Departments.hasMany(db.users, { foreignKey: 'fkDepartmentId', as: 'users' });
db.requestLeaves.belongsTo(db.users, {
  foreignKey: "requestLeaveSubmittedTo",
  as: "submittedToUser",
});
db.resolutions.belongsTo(db.sessions, {
  foreignKey: "fkSessionNo",
  as: "session",
});
db.resolutions.belongsTo(db.noticeOfficeDairies, {
  foreignKey: "fkNoticeOfficeDairyId",
  as: "noticeDiary",
});
db.resolutions.belongsTo(db.resolutionStatus, {
  foreignKey: "fkResolutionStatus",
  as: "resolutionStatus",
});
db.resolutions.belongsTo(db.resolutionDiaries, {
  foreignKey: "fkResolutionDairyId",
  as: "resolutionDiaries",
});
db.resolutions.hasMany(db.resolutionMovers, {
  foreignKey: "fkResolutionId",
  as: "resolutionMoversAssociation",
});
db.resolutionMovers.belongsTo(db.resolutions, {
  foreignKey: "fkResolutionId",
  as: "resolutionAssociation",
});
db.resolutionMovers.belongsTo(db.members, {
  foreignKey: "fkMemberId",
  as: "memberAssociation",
});
db.members.belongsToMany(db.resolutions, {
  through: "resolutionMovers",
  foreignKey: "fkMemberId",
  otherKey: "fkResolutionId",
  as: "associatedResolutions",
});
db.resolutions.belongsTo(db.users, {
  as: "createdBy",
  foreignKey: "createdByUser",
});
db.resolutions.belongsTo(db.users, {
  as: "deletedBy",
  foreignKey: "deletedByUser",
});
db.resolutions.belongsTo(db.branches, {
  as: "initiatedBy",
  foreignKey: "initiatedByBranch",
});
db.resolutions.belongsTo(db.branches, {
  as: "sentTo",
  foreignKey: "sentToBranch",
});

db.manageSessions.belongsTo(db.sessions, { foreignKey: "fkSessionId" });
db.manageSessions.hasMany(db.sessionMemberDetails, {
  foreignKey: "fkSessionSittingId",
});
db.manageSessions.hasMany(db.sessionBreakDetails, {
  foreignKey: "fkSessionSittingId",
});
db.sessionAttendances.belongsTo(db.manageSessions, {
  foreignKey: "fkManageSessionId",
});
db.sessionAttendances.belongsTo(db.members, { foreignKey: "fkMemberId" });
db.seatingPlans.belongsTo(db.members, { foreignKey: "fkMemberId" });

db.questionLists.belongsToMany(db.questions, {
  through: "questionQuestionLists",
  foreignKey: "fkQuestionListId",
  otherKey: "fkQuestionId",
});
db.questionLists.belongsTo(db.sessions, { foreignKey: "fkSessionId" });
db.questionLists.belongsTo(db.groups, { foreignKey: "fkGroupId" });
db.questionLists.belongsTo(db.users, { foreignKey: "fkUserId" });
db.rota.belongsTo(db.sessions, { foreignKey: "fkSessionId", as: "sessions" });
db.rota.belongsTo(db.groups, { foreignKey: "fkGroupId", as: "groups" });
db.newRota.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "sessions",
});
db.newRota.belongsTo(db.groups, { foreignKey: "fkGroupId", as: "groups" });
db.furtherAllotmentDays.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "sessions",
});
db.furtherAllotmentDays.belongsTo(db.groups, {
  foreignKey: "fkGroupId",
  as: "groups",
});

db.questionQuestionLists.belongsTo(db.questionLists, {
  foreignKey: "fkQuestionListId",
  as: "questionList",
});
db.questionQuestionLists.belongsTo(db.questions, {
  foreignKey: "fkQuestionId",
});
db.supplementaryLists.belongsTo(db.questionLists, {
  foreignKey: "fkQuestionListId",
});
db.supplementaryLists.belongsToMany(db.questions, {
  through: "questionSupplementaryLists",
  foreignKey: "fkSupplementaryListId",
  otherKey: "fkQuestionId",
});

db.questionSupplementaryLists.belongsTo(db.supplementaryLists, {
  foreignKey: "fkSupplementaryListId",
  as: "questionSuppList",
});
db.questionSupplementaryLists.belongsTo(db.questions, {
  foreignKey: "fkQuestionId",
});
// db.questionSupplementaryLists.belongsTo(db.supplementaryLists, { foreignKey: 'fkSupplementaryListId' });
// db.questionSupplementaryLists.belongsTo(db.questions, { foreignKey: 'fkQuestionId' });

// db.questionSupplementaryLists.belongsTo(db.supplementaryLists, { foreignKey: 'fkSupplementaryListId' });
// db.questionSupplementaryLists.belongsTo(db.questions, { foreignKey: 'fkQuestionId' });

db.sessions.belongsTo(db.parliamentaryYears, {
  foreignKey: "fkParliamentaryYearId",
});
db.divisions.belongsTo(db.ministries, { foreignKey: "fkMinistryId" });
db.tenures.hasMany(db.members, { foreignKey: "fkTenureId", as: "members" });
db.parliamentaryYears.belongsTo(db.tenures, { foreignKey: "fkTenureId" });
db.parliamentaryYears.belongsTo(db.terms, { foreignKey: "fkTermId" });
db.terms.belongsTo(db.tenures, { foreignKey: "fkTenureId" });
db.groupsDivisions.belongsTo(db.divisions, { foreignKey: "fkDivisionId" });
db.groupsDivisions.belongsTo(db.groups, { foreignKey: "fkGroupId" , as: 'group' });
db.groupsDivisions.belongsTo(db.sessions, { foreignKey: "fkSessionId" });
// Associations
db.groups.hasMany(db.groupsDivisions, { foreignKey: "fkGroupId" });

//Manage Complaints
db.complaints.belongsTo(db.users, {
  as: "complaineeUser",
  foreignKey: "fkComplaineeUserId",
});
db.complaints.belongsTo(db.users, {
  as: "resolverUser",
  foreignKey: "fkAssignedResolverId",
});
db.complaints.belongsTo(db.branches, {
  as: "complaintType",
  foreignKey: "fkComplaintTypeId",
});
db.complaints.belongsTo(db.complaintCategories, {
  as: "complaintCategory",
  foreignKey: "fkComplaintCategoryId",
});
db.complaints.belongsTo(db.tonerModels, {
  as: "tonerModels",
  foreignKey: "fkTonerModelId",
});

db.resolverAssignments.belongsTo(db.users, {
  as: "assignedBy",
  foreignKey: "fkAssignedById",
});
db.resolverAssignments.belongsTo(db.users, {
  as: "assignedTo",
  foreignKey: "fkAssignedResolverId",
});
db.resolverAssignments.belongsTo(db.complaints, {
  foreignKey: "fkComplaintId",
});
db.inventoryBills.belongsTo(db.vendors, {
  as: "vendor",
  foreignKey: "fkVendorId",
});
//db.inventories.belongsTo(db.users , {as:'assignedToUser', foreignKey: 'fkAssignedToUser'})
db.inventories.belongsTo(db.inventoryBills, {
  as: "invoiceNumber",
  foreignKey: "fkInventoryBillId",
});
db.userInventory.belongsTo(db.inventories, {
  as: "assignedInventory",
  foreignKey: "fkInventoryId",
});
db.userInventory.belongsTo(db.users, {
  as: "assignedToUser",
  foreignKey: "fkAssignedToUserId",
});
db.userInventory.belongsTo(db.branches, {
  as: "assignedToBranch",
  foreignKey: "fkAssignedToBranchId",
});
db.tonerInstallations.belongsTo(db.tonerModels, {
  as: "tonerModel",
  foreignKey: "fkTonerModelId",
});
db.tonerInstallations.belongsTo(db.users, {
  as: "requestUser",
  foreignKey: "fkUserRequestId",
});
db.tonerInstallations.belongsTo(db.branches, {
  as: "requestBranch",
  foreignKey: "fkBranchRequestId",
});

// db.employees.belongsTo(db.users , { foreignKey: 'fkUserId'})
// db.users.hasOne(db.employees, { foreignKey: 'fkEmployeeId' })
//db.employees.belongsTo(db.users, { foreignKey: 'fkUserId' });
db.sessionMemberDetails.belongsTo(db.members, { foreignKey: "fkMemberId" });
db.sessionMemberDetails.belongsTo(db.manageSessions, {
  foreignKey: "fkSessionSittingId",
});
db.sessionBreakDetails.belongsTo(db.manageSessions, {
  foreignKey: "fkSessionSittingId",
});
// db.sessions.hasMany(db.manageSessions);
// User has one Employee. This will add fkEmployeeId to User model.
// db.users.belongsTo(db.employees, {
//   foreignKey: 'fkEmployeeId',
//   as:'user'
// });

//Employee belongs to User. This will add fkUserId to Employee model.

// db.users.hasOne(db.employees, { as: "employee", foreignKey: "fkUserId" });
db.users.belongsTo(db.roles, { foreignKey: "fkRoleId", as: "role" });
db.contactTemplates.belongsTo(db.users, { foreignKey: "fkUserId", as: "user" });
db.contactLists.hasMany(db.contactListUsers, {
  foreignKey: "fkListId",
  as: "contactMembers",
});
db.members.hasMany(db.contactListUsers, {
  foreignKey: "fkMemberId",
  as: "contactLists",
});
db.contactLists.belongsTo(db.users, { foreignKey: "fkUserId", as: "user" });
db.members.hasMany(db.contactListUsers, {
  foreignKey: "fkMemberId",
  as: "member",
});
db.contactListUsers.belongsTo(db.members, {
  foreignKey: "fkMemberId",
  as: "member",
});
db.smsSents.belongsTo(db.contactLists, {
  foreignKey: "fkListId",
  as: "contactList",
});

//private member bills
db.privateMemberBills.belongsTo(db.branches, {
  foreignKey: "fkBranchesId",
  as: "branch",
});

//legislative bills
db.legislativeBills.belongsTo(db.sessions, {
  foreignKey: "fkSessionNo",
  as: "session",
});
db.speechOnDemands.belongsTo(db.sessions, {
  foreignKey: "fkSessionNo",
  as: "session",
});
// motion list association
db.motionLists.belongsToMany(db.motions, {
  through: "motionMotionLists",
  foreignKey: "fkMotionListId",
  otherKey: "fkMotionId",
  as: "motions",
});

// resolution list associations
db.resolutionLists.belongsToMany(db.resolutions, {
  through: "resolutionResolutionLists",
  foreignKey: "fkResolutionListId",
  otherKey: "fkResolutionId",
  as: "resolutions",
});

// MNAs association
db.mnas.belongsTo(db.politicalParties, {
  foreignKey: "politicalParty",
  as: "politicalParties",
});

db.mnas.belongsTo(db.tenures, {
  foreignKey: "fkTenureId", as: "tenures"
});

db.mnas.belongsTo(db.parliamentaryYears, {
  foreignKey: "fkParliamentaryYearId",
  as: "parliamentaryYears",
});



// introduced In Senate Bills
db.introducedInSenateBills.belongsTo(db.parliamentaryYears, {
  foreignKey: "fkParliamentaryYearId",
  as: "parliamentaryYears",
});
db.introducedInSenateBills.belongsTo(db.tenures, {
  foreignKey: "fkTenureId",
  as: "tenures",
});
db.introducedInSenateBills.belongsTo(db.terms, {
  foreignKey: "fkTermId",
  as: "terms",
});
db.introducedInSenateBills.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "sessions",
});
db.introducedInSenateBills.belongsTo(db.billStatuses, {
  foreignKey: "fkBillStatus",
  as: "billStatuses",
});
db.introducedInSenateBills.belongsTo(db.users, {
  foreignKey: "fkUserId",
  as: "user",
});
db.introducedInSenateBills.hasOne(db.introducedInHouses, {
  foreignKey: "fkIntroducedInHouseId",
  as: "introducedInHouses",
});
db.introducedInSenateBills.hasOne(db.memberPassages, {
  foreignKey: "fkMemberPassageId",
  as: "memberPassages",
});
db.introducedInSenateBills.hasMany(db.billDocuments, {
  foreignKey: "fkBillDocumentId",
  as: "billDocuments",
});
// senate Bill Ministry Movers
db.senateBillMinistryMovers.belongsTo(db.introducedInSenateBills, {
  foreignKey: "fkIntroducedInSenateBillId",
  as: "senateBillMinistryMovers",
});
db.senateBillMinistryMovers.belongsTo(db.ministries, {
  foreignKey: "fkMinistryId",
  as: "ministrie",
});
db.introducedInSenateBills.hasMany(db.senateBillMinistryMovers, {
  foreignKey: "fkIntroducedInSenateBillId",
  as: "senateBillMinistryMovers",
});
// senate Bill Mna Movers
db.senateBillMnaMovers.belongsTo(db.introducedInSenateBills, {
  foreignKey: "fkIntroducedInSenateBillId",
  as: "senateBillMnaMovers",
});
db.senateBillMnaMovers.belongsTo(db.mnas, { foreignKey: "fkMnaId", as: "mna" });
db.introducedInSenateBills.hasMany(db.senateBillMnaMovers, {
  foreignKey: "fkIntroducedInSenateBillId",
  as: "senateBillMnaMovers",
});
// senate Bill Member Movers
db.senateBillSenatorMovers.belongsTo(db.introducedInSenateBills, {
  foreignKey: "fkIntroducedInSenateBillId",
  as: "senateBillSenatorMovers",
});
db.senateBillSenatorMovers.belongsTo(db.members, {
  foreignKey: "fkSenatorId",
  as: "member",
});
db.introducedInSenateBills.hasMany(db.senateBillSenatorMovers, {
  foreignKey: "fkIntroducedInSenateBillId",
  as: "senateBillSenatorMovers",
});
// Introduced in house
db.introducedInHouses.belongsTo(db.sessions, {
  foreignKey: "fkSessionHouseId",
  as: "sessions",
});
db.introducedInHouses.belongsTo(db.manageCommittees, {
  foreignKey: "fkManageCommitteeId",
  as: "manageCommittees",
});
db.introducedInHouses.belongsTo(db.manageCommitteeRecomendations, { foreignKey: 'fkManageCommitteeRecomendationId', as: 'manageCommitteeRecomendations' });
db.introducedInHouses.belongsTo(db.introducedInSenateBills, {
  foreignKey: "fkIntroducedInHouseId",
  as: "introducedInSenateBills",
});
// Member Passage Details
db.memberPassages.belongsTo(db.sessions, {
  foreignKey: "fkSessionMemberPassageId",
  as: "sessions",
});
db.memberPassages.belongsTo(db.introducedInSenateBills, {
  foreignKey: "fkMemberPassageId",
  as: "introducedInSenateBills",
});
// Bill documents
db.billDocuments.belongsTo(db.introducedInSenateBills, {
  foreignKey: "fkBillDocumentId",
  as: "introducedInSenateBills",
});
// Ordinance Association
db.ordinances.belongsTo(db.parliamentaryYears, {
  foreignKey: "fkParliamentaryYearId",
  as: "parliamentaryYears",
});
// Ordinance documents
db.ordinanceDocuments.belongsTo(db.ordinances, {
  foreignKey: "fkBillId",
  as: "ordinances",
});
db.ordinances.belongsTo(db.billStatuses, {
  foreignKey: "fkOrdinanceStatus",
  as: "billStatuses",
});
db.ordinances.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "sessions",
});
db.ordinances.belongsTo(db.users, { foreignKey: "fkUserId", as: "user" });
// private membner bill status
db.privateMemberBills.belongsTo(db.billStatuses, {
  foreignKey: "fkBillStatus",
  as: "billStatuses",
});
// legislative Bill status
db.legislativeBills.belongsTo(db.billStatuses, {
  foreignKey: "fkBillStatus",
  as: "billStatuses",
});

// LDU Module
db.lawAct = require("./LDU/lawAct.model.js")(sequelize, SequelizeMain);

db.resolutionLists.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "sessionName",
});
db.motionLists.belongsTo(db.sessions, {
  foreignKey: "fkSessionId",
  as: "sessionName",
});


// Flag Module
db.flags = require('./flagModel')(sequelize, SequelizeMain);
db.flags.belongsTo(db.branches, {
  foreignKey: "fkBranchId",
  as: "branches",
});


// mnas associations
db.mnas.belongsToMany(db.ministries, { through: 'mnaMinistries', foreignKey: 'mnaId', as: 'ministries' });
// ministries associations
db.ministries.belongsToMany(db.mnas, { through: 'mnaMinistries', foreignKey: 'ministryId', as: 'mnas' });



db.legislativeBills.belongsTo(db.members, { foreignKey: 'web_id', targetKey: 'id', as: 'member' });
db.privateMemberBills.belongsTo(db.members, { foreignKey: 'web_id', targetKey: 'id', as: 'member' });
db.researchServices.belongsTo(db.members, { foreignKey: 'web_id', targetKey: 'id', as: 'member' });
db.speechOnDemands.belongsTo(db.members, { foreignKey: 'web_id', targetKey: 'id', as: 'member' });

sequelize.sync();
module.exports = db;
