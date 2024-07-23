const jwt = require("jsonwebtoken");

module.exports = (sequelize, Sequelize) => {
  const Employee = sequelize.define("employees", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fileNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    profileImage: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    supervisor: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    userType: {
      type: Sequelize.ENUM("Section User", "Section", "Officer"),
      allowNull: true,
    },
    reportingTo: {
      type: Sequelize.ENUM(
        "Director",
        "Director General",
        "Senior Director General",
        "Secretary",
        "Chairman"
      ),
      allowNull: true,
    },
    fkUserId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    fkDepartmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    fkDesignationId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "designations",
        key: "id",
      },
    },
    fkBranchId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "branches",
        key: "id",
      },
    },
    employeeStatus: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  Employee.associate = function (models) {
    Employee.belongsTo(models.users, { as: "users", foreignKey: "fkUserId" });
    Employee.belongsTo(models.designations, {
      as: "employeeDesignation",
      foreignKey: "fkDesignationId",
    });
    Employee.belongsTo(models.departments, {
      as: "departments",
      foreignKey: "fkDepartmentId",
    });
    Employee.belongsTo(models.branches, {
      foreignKey: "fkBranchId",
      as: "branches",
    });
  };

  return Employee;
};
