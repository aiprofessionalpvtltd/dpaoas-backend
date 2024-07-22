// services/rotaService.js
const db = require("../models");
const Rota = db.newRota;
const Divisions = db.divisions;
const Groups = db.groups;
const GroupDivisions = db.groupsDivisions;
const Sessions = db.sessions;
const moment = require('moment');
const rotaListService = require("../services/rotaList.service");
const fs = require('fs');
const path = require('path');

class newRotaService {

    async createRota(req) {
        try {
            const { fkSessionId, fkGroupId, startDate, endDate, allowedDates, weekDays, startGroup, skipGroups, pdfLink } = req;

            // Create a new Rota entry
            const newRota = await Rota.create({
                fkSessionId,
                fkGroupId,
                startDate: moment(startDate).format("YYYY-MM-DD"),
                endDate: moment(endDate).format("YYYY-MM-DD"),
                dateOfCreation: moment().format("YYYY-MM-DD"),
                dateOfAnswering: moment(startDate).add(13, 'days').format("YYYY-MM-DD"),
                weekDays,
                allowedDates,
                startGroup,
                skipGroups,
                pdfLink
            });

            // Fetch all groups and sort them cyclically starting from Group 1
            const allGroups = await Groups.findAll({
                order: [
                    [db.Sequelize.literal(`CASE WHEN "groups"."id" = 1 THEN 0 ELSE 1 END`), 'ASC'],
                    [db.Sequelize.literal(`(5 + "groups"."id" - 1) % 5`), 'ASC']
                ],
            });

            // Fetch session details
            const sessionDetails = await Sessions.findOne({
                where: { id: fkSessionId },
                attributes: ['id', 'sessionName']
            });

            const weekDayMap = {
                "Tuesday-Friday": [2, 5],
                "Wednesday-Friday": [3, 5],
                "Alternate Days": [2, 4, 6],
                "Regular Days": [1, 2, 3, 4, 5]
            };

            const exclusionDays = [6, 0]; // Exclude Saturday and Sunday
            const allowedWeekDays = weekDayMap[weekDays] || [];

            let dates = [];
            let currentDate = moment(startDate);
            const end = moment(endDate);
            let groupIndex = 0;  // Start at the first group (already sorted)

            while (currentDate <= end) {
                const currentFormattedDate = currentDate.format("YYYY-MM-DD");

                if (allowedWeekDays.includes(currentDate.day()) || allowedDates.includes(currentFormattedDate)) {
                    const skipGroupEntry = skipGroups.find(skip => skip.date === currentFormattedDate);
                    if (skipGroupEntry) {
                        if (skipGroupEntry.groupId === "*") {
                            currentDate.add(1, 'days');
                            continue;
                        }
                        const skipGroupId = parseInt(skipGroupEntry.groupId, 10);
                        if (allGroups[groupIndex % allGroups.length].id === skipGroupId) {
                            groupIndex++;
                        }
                    }

                    const group = allGroups[groupIndex % allGroups.length];
                    const groupsDivisions = await GroupDivisions.findAll({
                        where: { fkGroupId: group.id },
                        attributes: ['id', 'fkDivisionId', 'fkGroupId']
                    });
                    const divisionIds = groupsDivisions.map(division => division.fkDivisionId);
                    const divisions = await Divisions.findAll({
                        where: { id: divisionIds },
                        attributes: ['id', 'divisionName']
                    });

                    let dateOfAnswering = currentDate.clone().add(13, 'days');
                    // Adjust Date of Answering if it falls on an excluded day
                    while (exclusionDays.includes(dateOfAnswering.day())) {
                        dateOfAnswering.add(1, 'days');  // Move to the next day
                    }

                    dates.push({
                        DateOfCreation: currentDate.format("dddd, Do MMMM, YYYY"),
                        DateOfAnswering: dateOfAnswering.format("dddd, Do MMMM, YYYY"),
                        Group: {
                            groupId: group.id,
                            groupNameStarred: group.groupNameStarred,
                            groupNameUnstarred: group.groupNameUnstarred
                        },
                        Divisions: divisions
                    });

                    // Increment group index to rotate to the next group for the next date
                    groupIndex++;
                }
                currentDate.add(1, 'days');
            }
            return { newRota, sessionDetails, dates };

        } catch (error) {
            console.error(error);
            throw { message: error.message || "Error Creating ROTA List!" };
        }
    }

    async getAllRota(currentPage, pageSize) {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await Rota.findAndCountAll({
                offset,
                limit,
                order: [['id', 'DESC']],
            });

            const rotas = await Promise.all(rows.map(async rota => {
                const sessionDetails = await Sessions.findOne({
                    where: { id: rota.fkSessionId },
                    attributes: ['id', 'sessionName']
                });
                return {
                    ...rota.get({ plain: true }),
                    sessionDetails
                };
            }));

            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, rotas };
        } catch (error) {
            throw new Error('Error retrieving rotas');
        }
    }

    async getRotaById(id) {
        try {
            return await Rota.findByPk(id);
        } catch (error) {
            throw new Error('Error retrieving rota');
        }
    }

    async updateRota(id, data) {
        try {
            const rota = await Rota.findByPk(id);
            if (rota) {
                // Update the rota data
                const updatedRota = await rota.update(data);

                // Fetch the updated session details and dates
                const { sessionDetails, dates } = await this.getSessionDetailsAndDates(updatedRota);

                // Create the rotaList object to pass to createRotaListPDF
                const rotaList = { sessionDetails, dates };

                // Generate the PDF
                const rotaOutput = await rotaListService.createRotaListPDF(rotaList, updatedRota);
                const buffer = Buffer.from(rotaOutput);
                const fileName = `rota_${Date.now()}.pdf`;
                const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');

                if (!fs.existsSync(pdfDirectory)) {
                    fs.mkdirSync(pdfDirectory, { recursive: true });
                }

                const filePath = path.join(pdfDirectory, fileName);
                fs.writeFileSync(filePath, buffer);

                // Provide a link to download the PDF
                const fileLink = `/assets/${fileName}`;

                // Update the rota entry with the PDF link
                updatedRota.pdfLink = fileLink;
                await updatedRota.save();

                return updatedRota;
            }
            return null;
        } catch (error) {
            throw new Error('Error updating rota');
        }
    }

    // Helper function to get session details and dates
    async getSessionDetailsAndDates(rota) {
        try {
            const sessionDetails = await Sessions.findOne({
                where: { id: rota.fkSessionId },
                attributes: ['id', 'sessionName']
            });

            const dates = await this.calculateDates(rota);

            return { sessionDetails, dates };
        } catch (error) {
            throw new Error('Error fetching session details and dates');
        }
    }

    // Helper function to calculate dates
    async calculateDates(rota) {
        try {
            const allGroups = await Groups.findAll({
                order: [
                    [db.Sequelize.literal(`CASE WHEN "groups"."id" = 1 THEN 0 ELSE 1 END`), 'ASC'],
                    [db.Sequelize.literal(`(5 + "groups"."id" - 1) % 5`), 'ASC']
                ],
            });

            const weekDayMap = {
                "Tuesday-Friday": [2, 5],
                "Wednesday-Friday": [3, 5],
                "Alternate Days": [2, 4, 6],
                "Regular Days": [1, 2, 3, 4, 5]
            };

            const exclusionDays = [6, 0]; // Exclude Saturday and Sunday
            const allowedWeekDays = weekDayMap[rota.weekDays] || [];

            let dates = [];
            let currentDate = moment(rota.startDate);
            const end = moment(rota.endDate);
            let groupIndex = 0;

            while (currentDate <= end) {
                const currentFormattedDate = currentDate.format("YYYY-MM-DD");

                if (allowedWeekDays.includes(currentDate.day()) || rota.allowedDates.includes(currentFormattedDate)) {
                    const skipGroupEntry = rota.skipGroups.find(skip => skip.date === currentFormattedDate);
                    if (skipGroupEntry) {
                        if (skipGroupEntry.groupId === "*") {
                            currentDate.add(1, 'days');
                            continue;
                        }
                        const skipGroupId = parseInt(skipGroupEntry.groupId, 10);
                        if (allGroups[groupIndex % allGroups.length].id === skipGroupId) {
                            groupIndex++;
                        }
                    }

                    const group = allGroups[groupIndex % allGroups.length];
                    const groupsDivisions = await GroupDivisions.findAll({
                        where: { fkGroupId: group.id },
                        attributes: ['id', 'fkDivisionId', 'fkGroupId']
                    });
                    const divisionIds = groupsDivisions.map(division => division.fkDivisionId);
                    const divisions = await Divisions.findAll({
                        where: { id: divisionIds },
                        attributes: ['id', 'divisionName']
                    });

                    let dateOfAnswering = currentDate.clone().add(13, 'days');
                    // Adjust Date of Answering if it falls on an excluded day
                    while (exclusionDays.includes(dateOfAnswering.day())) {
                        dateOfAnswering.add(1, 'days');  // Move to the next day
                    }

                    dates.push({
                        DateOfCreation: currentDate.format("dddd, Do MMMM, YYYY"),
                        DateOfAnswering: dateOfAnswering.format("dddd, Do MMMM, YYYY"),
                        Group: {
                            groupId: group.id,
                            groupNameStarred: group.groupNameStarred,
                            groupNameUnstarred: group.groupNameUnstarred
                        },
                        Divisions: divisions
                    });

                    // Increment group index to rotate to the next group for the next date
                    groupIndex++;
                }
                currentDate.add(1, 'days');
            }
            return dates;
        } catch (error) {
            throw new Error('Error calculating dates');
        }
    }
}

module.exports = new newRotaService();