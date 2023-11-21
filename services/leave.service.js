const db = require("../models");
const requestLeaves = db.requestLeaves;
const Modules = db.modules;
const RolesPermissions = db.rolesPermissions;
//const ModulesRolesPermissions = db.modules_roles_permissions;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const leaveService = {
    // Create A New Role
    createleave: async (req) => {
        try {
            let { fkRequestTypeId, fkUserId, requestStartDate, requestEndDate, requestStatus, requestLeaveSubType, requestLeaveReason,
                requestNumberOfDays, requestStationLeave, requestLeaveAttachment,
                requestLeaveSubmittedTo, requestLeaveApplyOnBehalf, requestLeaveForwarder } = req;

            const leaveRequest = await requestLeaves.create({
                fkRequestTypeId,
                fkUserId,
                requestStartDate,
                requestEndDate,
                requestStatus,
                requestLeaveSubType,
                requestLeaveReason,
                requestNumberOfDays,
                requestStationLeave,
                requestLeaveAttachment,
                requestLeaveSubmittedTo,
                requestLeaveApplyOnBehalf,
                requestLeaveForwarder
            });

            return leaveRequest;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw error; // or handle the error in a way that makes sense for your application
        }
    },

    updateleave: async (id, payload) => {
        try {
            const result = await requestLeaves.update(payload, {
                where: { id: id },
            });

            if (result[0] > 0) {
                return result;
            } else {
                console.log('No rows were updated. Check if the record with the provided ID exists.');
            }
        } catch (error) {
            console.error('Error updating leave request:', error.message);
        }
    },

    // Retrieve All Roles
    findAllRoles: async () => {
        try {
            const roles = await Roles.findAll();
            return roles;
        }
        catch (error) {
            throw ({ message: "Error Fetching All Roles!" })

        }
    },

    // Assign a permission to a role
    editRole: async (req) => {
        // Validate request
        if (!req.roleId || !req.permissionId) {
            throw ({ message: 'Please provide roleId and permissionId!' });
        }
        // Check if the link already exists
        const existingLink = await RolesPermissions.findOne({
            where: {
                roleId: req.roleId,
                permissionId: req.permissionId,
            },
        });

        if (existingLink) {
            throw ({ message: 'Role and Permission Already Exists!' });
        }

        // Before assigning, let's ensure that the provided IDs actually exist in their respective tables.
        const [role, permission] = await Promise.all([
            Roles.findByPk(req.roleId),
            Permissions.findByPk(req.permissionId),
        ]);

        if (!role) {
            throw ({ message: 'Role Not Found!' });
        }

        if (!permission) {
            throw ({ message: 'Permission Not Found!' });
        }

        // All entities exist, let's link them
        const linkData = {
            roleId: role.id,
            permissionId: permission.id,
        };

        const rolesPermissions = await RolesPermissions.create(linkData);
        return rolesPermissions;

    },
}

module.exports = leaveService