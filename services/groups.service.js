const db = require("../models");
const Divisions = db.divisions;
const Ministries = db.ministries
const Groups = db.groups
const groupsDivisions = db.groupsDivisions
const Sessions = db.sessions
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const divisionsService = {

    // Create Group
    createGroup: async (req) => {
        try {
            // Create the Group and save it in the database
            const group = await Groups.create(req)
            return group
        } catch (error) {
            throw { message: error.message || "Error Creating Group!" };

        }
    },

    // Get All Groups
    getAllGroups: async () => {
        try {
            const groups = await Groups.findAll()
            return groups
        } catch (error) {
            throw { message: error.message || "Error Creating Group!" };
        }
    },

    // Manage Division in Group
    manageDivisionInGroup: async (req, sessionId) => {
        try {
            for (const groupName in req) {
                if (groupName !== 'availableDivisions') {
                    const group = req[groupName];
                    const groupId = group.id;
                    const divisionIds = group.list.map(division => division.id);

                    // Check and delete existing associations for these divisions in the session
                    await groupsDivisions.destroy({
                        where: {
                            fkDivisionId: divisionIds,
                            fkGroupId: groupId,
                            fkSessionId: sessionId,
                        }
                    });

                    // Prepare bulk create data
                    const bulkCreateData = divisionIds.map(divisionId => ({
                        fkGroupId: groupId,
                        fkDivisionId: divisionId,
                        fkSessionId: sessionId
                    }));

                    // Bulk create new associations
                    await groupsDivisions.bulkCreate(bulkCreateData);
                }
            }

            // Handle availableDivisions: Remove their associations in bulk
            const availableDivisionIds = req.availableDivisions.map(division => division.id);
            await groupsDivisions.destroy({
                where: {
                    fkDivisionId: availableDivisionIds,
                    fkSessionId: sessionId,
                }
            });

        } catch (error) {
            console.error('Error managing Division in Group:', error);
            throw new Error('Error managing Division in Group');
        }
    },

    // Retrieve Divisions For Groups   
    retrieveDivisionsForGroups: async (filteredGroupsDivisions) => {
        try {
            const groupsWithDivisions = {};
            // Fetch all divisions 
            const allDivisions = await Divisions.findAll({
                attributes: ['id', 'divisionName'],
            });
            const divisionsMap = new Map(allDivisions.map(division => [division.id, division]));

            // Iterate over each filtered GroupsDivisions entry to populate groupsWithDivisions
            for (const { fkGroupId, fkDivisionId } of filteredGroupsDivisions) {
                const groupName = `group${fkGroupId}`;
                const division = divisionsMap.get(fkDivisionId);

                // Initialize the group in the result object if it doesn't exist
                if (!groupsWithDivisions[groupName]) {
                    groupsWithDivisions[groupName] = {
                        id: fkGroupId,
                        groupId: groupName,
                        list: [],
                    };
                }
                // Add the division to the group's list
                if (division) {
                    groupsWithDivisions[groupName].list.push({
                        id: division.id,
                        divisionName: division.divisionName,
                    });
                }
            }
            // Determine available divisions
            const associatedDivisionIds = new Set(filteredGroupsDivisions.map(({ fkDivisionId }) => fkDivisionId));
            const availableDivisions = allDivisions.filter(division => !associatedDivisionIds.has(division.id));
            // Add availableDivisions to the result object
            groupsWithDivisions.availableDivisions = {
                id: "availableDivisions",
                list: availableDivisions.map(({ id, divisionName }) => ({
                    id,
                    divisionName,
                })),
            };
            return groupsWithDivisions;
        } catch (error) {
            throw new Error(error.message || 'Error retrieving divisions for groups');
        }
    },




}

module.exports = divisionsService
